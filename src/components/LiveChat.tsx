
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageCircle, Users, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import VideoCall from "./VideoCall";

type ChatMessage = {
  id: string;
  text: string | null;
  audio_url: string | null;
  sender_phone: string;
  timestamp: string;
};

type Profile = {
  name: string;
  image: string | null;
  phone: string;
};

const LiveChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showProfiles, setShowProfiles] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user from localStorage profiles
  const getCurrentUser = () => {
    const storedProfiles = localStorage.getItem("student-profiles");
    if (storedProfiles) {
      const parsed = JSON.parse(storedProfiles);
      return parsed.length > 0 ? parsed[parsed.length - 1] : null;
    }
    return null;
  };

  useEffect(() => {
    fetchMessages();
    fetchProfiles();
    const cleanup = setupRealtime();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages...');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      console.log('Messages fetched:', data?.length || 0);
      setMessages(data || []);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error fetching messages:', error);
      setConnectionStatus('error');
      toast({
        title: "Error",
        description: "Failed to load chat messages.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      console.log('Fetching profiles...');
      
      // Always prioritize Supabase profiles as the source of truth
      const { data: supabaseProfiles, error } = await supabase
        .from('public_profiles')
        .select('name, image, phone');

      if (error) {
        console.error('Error fetching Supabase profiles:', error);
        setConnectionStatus('error');
        return;
      }

      let allProfiles: Profile[] = [];

      // Add Supabase profiles first
      if (supabaseProfiles && supabaseProfiles.length > 0) {
        console.log('Supabase profiles found:', supabaseProfiles.length, 'profiles:', supabaseProfiles);
        allProfiles = supabaseProfiles.map((p: any) => ({
          name: p.name,
          image: p.image || null,
          phone: p.phone
        }));
        console.log('Mapped Supabase profiles:', allProfiles);
      } else {
        console.log('No Supabase profiles found');
      }

      // Only add localStorage profiles if they're not already in Supabase
      const storedProfiles = localStorage.getItem("student-profiles");
      if (storedProfiles) {
        try {
          const parsed = JSON.parse(storedProfiles);
          console.log('Local profiles found:', parsed.length, 'profiles:', parsed);
          
          const phoneNumbers = new Set(allProfiles.map(p => p.phone));
          console.log('Existing phone numbers:', Array.from(phoneNumbers));
          
          const uniqueLocalProfiles = parsed
            .filter((p: any) => p.phone && !phoneNumbers.has(p.phone))
            .map((p: any) => ({
              name: p.name,
              image: p.image || null,
              phone: p.phone
            }));
          
          console.log('Unique local profiles after filtering:', uniqueLocalProfiles);
          allProfiles = [...allProfiles, ...uniqueLocalProfiles];
        } catch (parseError) {
          console.error('Error parsing localStorage profiles:', parseError);
        }
      } else {
        console.log('No localStorage profiles found');
      }

      console.log('Final profiles array:', allProfiles.length, 'total profiles:', allProfiles);
      setProfiles(allProfiles);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setConnectionStatus('error');
    }
  };

  const setupRealtime = () => {
    console.log('Setting up real-time subscriptions...');
    
    // Set up real-time subscription for messages
    const messagesChannel = supabase
      .channel('messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('New message received:', payload.new);
          setMessages(prev => [...prev, payload.new as ChatMessage]);
          setConnectionStatus('connected');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Message deleted:', payload.old);
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log('Messages subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
        }
      });

    // Set up real-time subscription for public_profiles
    const profilesChannel = supabase
      .channel('public_profiles_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_profiles',
        },
        (payload) => {
          console.log('New profile added:', payload.new);
          fetchProfiles();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'public_profiles',
        },
        (payload) => {
          console.log('Profile updated:', payload.new);
          fetchProfiles();
        }
      )
      .subscribe((status) => {
        console.log('Profiles subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
        }
      });

    return () => {
      console.log('Cleaning up real-time subscriptions...');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(profilesChannel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!newMessage.trim() || !currentUser) {
      toast({
        title: "Missing information",
        description: currentUser ? "Please enter a message." : "Please set up your profile first.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Sending message:', newMessage, 'from:', currentUser.phone);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          text: newMessage.trim(),
          sender_phone: currentUser.phone,
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      setNewMessage("");
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getProfileByPhone = (phone: string | null) => {
    if (!phone) return null;
    const profile = profiles.find(p => p.phone === phone);
    console.log('Looking for profile with phone:', phone, 'found:', profile);
    return profile;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const deleteAllMessages = async () => {
    const confirmed = window.confirm("Are you sure you want to delete ALL messages for everyone? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        throw error;
      }

      setMessages([]);
      toast({
        title: "All messages deleted",
        description: "All chat messages have been deleted for everyone.",
      });

      console.log('All messages deleted successfully');
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast({
        title: "Error",
        description: "Failed to delete messages. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'connecting': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] md:h-[600px] bg-white rounded-lg shadow-lg border relative"
         style={{ height: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-50 relative">
        {/* Video Call Button - Top Left */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVideoCallOpen(true)}
          className="absolute left-4 top-4 flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 z-10"
        >
          <Video className="w-4 h-4" />
          Video Call
        </Button>
        
        {/* Center Content */}
        <div className="flex items-center gap-2 flex-1 justify-center ml-20">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Live Chat</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </span>
        </div>
        
        {/* Right Side Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={deleteAllMessages}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProfiles(!showProfiles)}
            className="flex items-center gap-1"
          >
            <Users className="w-4 h-4" />
            Profiles ({profiles.length})
          </Button>
        </div>
      </div>

      {/* Profiles Panel */}
      {showProfiles && (
        <div className="p-4 border-b bg-gray-50 max-h-32 overflow-y-auto">
          {profiles.length === 0 ? (
            <p className="text-sm text-gray-500">No profiles found. Make sure to set up your profile first.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {profiles.map((profile, index) => (
                <div key={`${profile.phone}-${index}`} className="flex items-center gap-2 text-sm">
                  <Avatar className="w-6 h-6">
                    {profile.image ? (
                      <AvatarImage src={profile.image} alt={profile.name} />
                    ) : (
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="truncate">{profile.name}</span>
                  <span className="text-xs text-gray-400">({profile.phone})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const profile = getProfileByPhone(message.sender_phone) || {
              name: `User (${message.sender_phone})`,
              image: null,
              phone: message.sender_phone
            };
            
            return (
              <div key={message.id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  {profile.image ? (
                    <AvatarImage src={profile.image} alt={profile.name} />
                  ) : (
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {profile.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                    {message.text || (message.audio_url && "🎵 Audio message")}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t bg-gray-50 sticky bottom-0 z-10"
            style={{ paddingBottom: 'env(keyboard-inset-height, 1rem)' }}>
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={connectionStatus === 'error'}
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={connectionStatus === 'error' || !newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {connectionStatus === 'error' && (
          <p className="text-xs text-red-600 mt-1">
            Connection error. Please refresh the page to try again.
          </p>
        )}
      </form>
      
      {/* Video Call Modal */}
      <VideoCall 
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        currentUser={getCurrentUser()}
      />
    </div>
  );
};

export default LiveChat;

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, Phone, Video, MoreVertical, ArrowLeft, Paperclip, Mic, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

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

interface WhatsAppChatProps {
  onBack?: () => void;
  contactName?: string;
  contactPhone?: string;
  contactImage?: string;
}

const WhatsAppChat = ({ onBack, contactName = "Live Chat", contactPhone, contactImage }: WhatsAppChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
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
    setupRealtime();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
      const storedProfiles = localStorage.getItem("student-profiles");
      let localProfiles: Profile[] = [];
      
      if (storedProfiles) {
        const parsed = JSON.parse(storedProfiles);
        localProfiles = parsed.map((p: any) => ({
          name: p.name,
          image: p.image || null,
          phone: p.phone
        }));
      }

      const { data: supabaseProfiles, error } = await supabase
        .from('public_profiles')
        .select('name, image, phone');

      let allProfiles = [...localProfiles];
      
      if (supabaseProfiles && !error) {
        const phoneNumbers = new Set(localProfiles.map(p => p.phone));
        const uniqueSupabaseProfiles = supabaseProfiles.filter(p => !phoneNumbers.has(p.phone));
        allProfiles = [...allProfiles, ...uniqueSupabaseProfiles];
      }

      setProfiles(allProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const setupRealtime = () => {
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
          setMessages(prev => [...prev, payload.new as ChatMessage]);
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
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    const profilesChannel = supabase
      .channel('public_profiles_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'public_profiles',
        },
        (payload) => {
          fetchProfiles();
        }
      )
      .subscribe();

    return () => {
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
      const { error } = await supabase
        .from('messages')
        .insert({
          text: newMessage.trim(),
          sender_phone: currentUser.phone,
        });

      if (error) {
        throw error;
      }

      setNewMessage("");
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
    return profiles.find(p => p.phone === phone);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const isOwnMessage = (senderPhone: string) => {
    const currentUser = getCurrentUser();
    return currentUser?.phone === senderPhone;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* WhatsApp Header */}
      <div className="flex items-center justify-between p-4 bg-green-600 text-white shadow-md">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-green-700 p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <Avatar className="w-10 h-10">
            {contactImage ? (
              <AvatarImage src={contactImage} alt={contactName} />
            ) : (
              <AvatarFallback className="bg-green-700 text-white">
                {getInitials(contactName)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{contactName}</h3>
            <p className="text-xs text-green-100">
              {profiles.length > 0 ? `${profiles.length} participants` : "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-green-700 p-2"
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-green-700 p-2"
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-green-700 p-2"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="bg-white rounded-full p-6 mb-4 shadow-lg">
              <Smile className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">No messages here yet...</p>
            <p className="text-sm text-center px-8">
              Send a message to start the conversation. All your messages are secured with end-to-end encryption.
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const profile = getProfileByPhone(message.sender_phone) || {
              name: 'Unknown User',
              image: null,
              phone: message.sender_phone
            };
            
            const isOwn = isOwnMessage(message.sender_phone);
            const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender_phone !== message.sender_phone);
            
            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                {!isOwn && (
                  <div className="w-8 mr-2 flex justify-center">
                    {showAvatar && (
                      <Avatar className="w-8 h-8">
                        {profile.image ? (
                          <AvatarImage src={profile.image} alt={profile.name} />
                        ) : (
                          <AvatarFallback className="text-xs bg-gray-300 text-gray-700">
                            {getInitials(profile.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-md ${
                  isOwn 
                    ? 'bg-green-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none'
                }`}>
                  {!isOwn && showAvatar && (
                    <p className="text-xs font-semibold text-green-600 mb-1">
                      {profile.name}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">
                    {message.text || (message.audio_url && "🎵 Audio message")}
                  </p>
                  <div className={`flex items-center justify-end mt-1 gap-1 ${
                    isOwn ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    <span className="text-xs">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {isOwn && (
                      <svg width="16" height="15" className="text-green-100">
                        <path 
                          fill="currentColor" 
                          d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L3.724 9.587a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.063-.51z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-gray-200">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:bg-gray-300 p-2"
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="bg-white rounded-full pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 border-none"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:bg-gray-100 p-1"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>
          {newMessage.trim() ? (
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 rounded-full p-3"
            >
              <Send className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700 rounded-full p-3"
            >
              <Mic className="w-5 h-5" />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default WhatsAppChat;
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft, Users, MoreVertical, Phone, VideoIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

type ChatMessage = {
  id: string;
  message: string;
  sender_name: string;
  sender_image: string | null;
  sender_phone: string | null;
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
  const [showChat, setShowChat] = useState(false);
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
        .from('chat_messages')
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

  const setupRealtime = () => {
    // Set up real-time subscription for chat messages
    const messagesChannel = supabase
      .channel('chat_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('New message received:', payload.new);
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('Message deleted:', payload.old);
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
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
        .from('chat_messages')
        .insert({
          message: newMessage.trim(),
          sender_name: currentUser.name,
          sender_phone: currentUser.phone,
          sender_image: currentUser.image || null,
        });

      if (error) {
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const getCurrentUser_Display = getCurrentUser();
  const latestMessage = messages[messages.length - 1];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!showChat) {
    // Chat List View (WhatsApp-like)
    return (
      <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg border overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-medium">Chats</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-green-700">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-green-700">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search or start new chat" 
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <div 
            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b"
            onClick={() => setShowChat(true)}
          >
            <Avatar className="w-12 h-12 mr-3">
              <AvatarFallback className="bg-green-100 text-green-800 text-lg font-medium">
                CG
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate">Class Group</h3>
                <span className="text-xs text-gray-500">
                  {latestMessage ? formatTimestamp(latestMessage.timestamp) : ""}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {latestMessage 
                    ? `${latestMessage.sender_name}: ${latestMessage.message}`
                    : "Tap to start messaging"
                  }
                </p>
                {messages.length > 0 && (
                  <div className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                    {messages.length > 99 ? "99+" : messages.length}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg border overflow-hidden">
      {/* Chat Header */}
      <div className="bg-green-600 text-white p-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-green-700 p-1"
            onClick={() => setShowChat(false)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-white text-green-600 font-medium">
              CG
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium">Class Group</h3>
            <p className="text-xs text-green-100">Online</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 p-2">
              <VideoIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 p-2">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-green-700 p-2">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmOWY5ZjkiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSIjZjBmMGYwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')",
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Messages you send to this group will be secured with end-to-end encryption.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = getCurrentUser_Display?.phone === message.sender_phone;
            
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  isCurrentUser 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white border shadow-sm'
                }`}>
                  {!isCurrentUser && (
                    <p className="text-xs font-medium text-green-600 mb-1">
                      {message.sender_name}
                    </p>
                  )}
                  <p className="text-sm break-words">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 bg-gray-50 border-t">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full border">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="border-0 rounded-full focus:ring-0 focus:border-0"
            />
          </div>
          <Button 
            type="submit" 
            size="sm" 
            className="rounded-full bg-green-600 hover:bg-green-700 w-10 h-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LiveChat;
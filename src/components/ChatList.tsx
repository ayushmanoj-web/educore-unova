import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Users, Search, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar?: string;
  unreadCount?: number;
  isOnline?: boolean;
  type: 'individual' | 'group';
};

const ChatList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([
    {
      id: "1",
      name: "Study Group Chat",
      lastMessage: "Hey everyone! Don't forget about tomorrow's exam",
      timestamp: new Date().toISOString(),
      avatar: "/placeholder.svg",
      unreadCount: 3,
      isOnline: true,
      type: 'group'
    },
    {
      id: "2", 
      name: "Math Study Group",
      lastMessage: "Can someone explain question 5?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 1,
      isOnline: true,
      type: 'group'
    },
    {
      id: "3",
      name: "John Doe",
      lastMessage: "Thanks for the notes!",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isOnline: false,
      type: 'individual'
    },
    {
      id: "4",
      name: "Physics Class",
      lastMessage: "Lab report due next week",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      unreadCount: 2,
      isOnline: true,
      type: 'group'
    }
  ]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
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

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (chatId: string) => {
    if (chatId === "1") {
      navigate("/whatsapp-chat");
    } else {
      // For other chats, you could navigate to specific chat rooms
      navigate("/whatsapp-chat");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-green-600 text-white shadow-md">
        <h1 className="text-xl font-semibold">Chats</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-green-700 p-2"
          >
            <Search className="w-5 h-5" />
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

      {/* Search Bar */}
      <div className="p-4 border-b bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats"
            className="pl-10 bg-white rounded-full"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No chats found</h3>
            <p className="text-sm text-center">
              {searchQuery ? "Try adjusting your search" : "Start a new conversation to get chatting"}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 active:bg-gray-100"
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  {chat.avatar ? (
                    <AvatarImage src={chat.avatar} alt={chat.name} />
                  ) : (
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {chat.type === 'group' ? <Users className="w-6 h-6" /> : getInitials(chat.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 ml-3 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTimestamp(chat.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage}
                  </p>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center ml-2">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-20 right-4">
        <Button
          onClick={() => navigate("/whatsapp-chat")}
          className="bg-green-600 hover:bg-green-700 rounded-full w-14 h-14 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default ChatList;
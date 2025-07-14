import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, Plus, MessageCircle, Users, LogOut, Settings } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { ChatRoom, UserProfile } from "@/pages/ChatApp";
import { toast } from "@/hooks/use-toast";

interface ChatSidebarProps {
  chatRooms: ChatRoom[];
  userProfiles: UserProfile[];
  selectedChatRoom: ChatRoom | null;
  onSelectChatRoom: (room: ChatRoom) => void;
  onCreateNewChat: (userId: string) => void;
  currentUser: User;
}

const ChatSidebar = ({
  chatRooms,
  userProfiles,
  selectedChatRoom,
  onSelectChatRoom,
  onCreateNewChat,
  currentUser,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatSheet, setShowNewChatSheet] = useState(false);

  const filteredChatRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUserProfile = userProfiles.find(p => p.user_id === currentUser.id);
  const otherUsers = userProfiles.filter(p => p.user_id !== currentUser.id);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleSignOut = async () => {
    try {
      // Update user presence to offline
      if (currentUserProfile) {
        await supabase
          .from('user_profiles')
          .update({
            is_online: false,
            last_seen: new Date().toISOString()
          })
          .eq('user_id', currentUser.id);
      }

      await supabase.auth.signOut();
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStartNewChat = (userId: string) => {
    onCreateNewChat(userId);
    setShowNewChatSheet(false);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
          <div className="flex items-center gap-2">
            <Sheet open={showNewChatSheet} onOpenChange={setShowNewChatSheet}>
              <SheetTrigger asChild>
                <Button size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Start New Chat
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ScrollArea className="h-[calc(100vh-100px)]">
                    <div className="space-y-2">
                      {otherUsers.map((profile) => (
                        <div
                          key={profile.id}
                          onClick={() => handleStartNewChat(profile.user_id)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              {profile.avatar_url ? (
                                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                              ) : (
                                <AvatarFallback className="bg-blue-100 text-blue-800">
                                  {getInitials(profile.display_name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            {profile.is_online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {profile.display_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {profile.is_online ? "Online" : formatLastSeen(profile.last_seen)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChatRooms.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No chats found</p>
              <p className="text-gray-400 text-xs mt-1">Start a new conversation!</p>
            </div>
          ) : (
            filteredChatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onSelectChatRoom(room)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  selectedChatRoom?.id === room.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                      {getInitials(room.name)}
                    </AvatarFallback>
                  </Avatar>
                  {!room.is_group && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {room.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatLastSeen(room.updated_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {room.description || "No messages yet"}
                    </p>
                    {/* Placeholder for unread count */}
                    {Math.random() > 0.7 && (
                      <Badge variant="default" className="h-5 min-w-[20px] text-xs bg-blue-600">
                        {Math.floor(Math.random() * 9) + 1}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              {currentUserProfile?.avatar_url ? (
                <AvatarImage src={currentUserProfile.avatar_url} alt={currentUserProfile.display_name} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {getInitials(currentUserProfile?.display_name || currentUser.email?.split('@')[0] || 'U')}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {currentUserProfile?.display_name || currentUser.email?.split('@')[0]}
            </p>
            <p className="text-sm text-green-600">Online</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { toast } from "@/hooks/use-toast";

export type ChatRoom = {
  id: string;
  name: string;
  description?: string;
  is_group: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  participants?: any[];
  last_message?: any;
  unread_count?: number;
};

export type UserProfile = {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
};

const ChatApp = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Update user presence
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: session.user.id,
          display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0],
          is_online: true,
          last_seen: new Date().toISOString()
        });
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    // Fetch user's chat rooms and user profiles
    fetchChatRooms();
    fetchUserProfiles();

    // Set up real-time subscriptions
    const chatRoomsSubscription = supabase
      .channel('chat_rooms_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_rooms'
      }, () => {
        fetchChatRooms();
      })
      .subscribe();

    const userProfilesSubscription = supabase
      .channel('user_profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_profiles'
      }, () => {
        fetchUserProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chatRoomsSubscription);
      supabase.removeChannel(userProfilesSubscription);
    };
  }, [user]);

  const fetchChatRooms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_participants')
        .select(`
          chat_room_id,
          chat_rooms (
            id,
            name,
            description,
            is_group,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const rooms = data?.map((item: any) => item.chat_rooms).filter(Boolean) || [];
      setChatRooms(rooms);
    } catch (error: any) {
      console.error('Error fetching chat rooms:', error);
      toast({
        title: "Error loading chats",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchUserProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('is_online', { ascending: false })
        .order('last_seen', { ascending: false });

      if (error) throw error;

      setUserProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching user profiles:', error);
    }
  };

  const createNewChat = async (targetUserId: string) => {
    if (!user) return;

    try {
      // Check if chat already exists between these users
      const { data: existingChat, error: checkError } = await supabase
        .from('chat_participants')
        .select(`
          chat_room_id,
          chat_rooms!inner (
            id,
            name,
            description,
            is_group,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('user_id', user.id);

      if (checkError) throw checkError;

      // Find direct (non-group) chat
      const directChat = existingChat?.find((chat: any) => !chat.chat_rooms.is_group);
      
      if (directChat) {
        // Chat already exists, select it
        const room = directChat.chat_rooms;
        setSelectedChatRoom(room);
        return;
      }

      // Create new chat room
      const targetProfile = userProfiles.find(p => p.user_id === targetUserId);
      const currentProfile = userProfiles.find(p => p.user_id === user.id);
      
      const chatName = `${currentProfile?.display_name || 'You'} and ${targetProfile?.display_name || 'User'}`;

      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: chatName,
          is_group: false,
          created_by: user.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_room_id: newRoom.id, user_id: user.id, is_admin: true },
          { chat_room_id: newRoom.id, user_id: targetUserId, is_admin: false }
        ]);

      if (participantsError) throw participantsError;

      setSelectedChatRoom(newRoom);
      
      toast({
        title: "New chat created",
        description: `Started conversation with ${targetProfile?.display_name}`,
      });

    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error creating chat",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      <ChatSidebar
        chatRooms={chatRooms}
        userProfiles={userProfiles}
        selectedChatRoom={selectedChatRoom}
        onSelectChatRoom={setSelectedChatRoom}
        onCreateNewChat={createNewChat}
        currentUser={user}
      />
      <div className="flex-1">
        {selectedChatRoom ? (
          <ChatWindow
            chatRoom={selectedChatRoom}
            currentUser={user}
            userProfiles={userProfiles}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to ChatApp</h3>
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
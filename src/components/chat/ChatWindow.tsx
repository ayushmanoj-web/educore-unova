import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Smile, 
  Paperclip, 
  Mic, 
  Phone, 
  Video, 
  MoreVertical,
  Download,
  Play,
  Pause,
  Upload
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { ChatRoom, UserProfile } from "@/pages/ChatApp";
import { toast } from "@/hooks/use-toast";
// Simple message bubble component
const MessageBubble = ({ message, isOwn, senderName }: { message: any, isOwn: boolean, senderName: string }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
      isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      {!isOwn && <p className="text-xs font-medium mb-1">{senderName}</p>}
      <p className="text-sm">{message.text || message.content}</p>
      <p className="text-xs opacity-70 mt-1">
        {new Date(message.timestamp || message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
);

interface ChatMessage {
  id: string;
  text?: string;
  sender_phone: string;
  timestamp: string;
}

interface ChatWindowProps {
  chatRoom: ChatRoom;
  currentUser: User;
  userProfiles: UserProfile[];
}

const ChatWindow = ({ chatRoom, currentUser, userProfiles }: ChatWindowProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatRoom) {
      fetchMessages();
      
      // Set up real-time subscription for messages
      const messagesSubscription = supabase
        .channel(`chat_messages_${chatRoom.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoom.id}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoom.id}`
        }, (payload) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === payload.new.id ? payload.new as ChatMessage : msg
            )
          );
        })
        .subscribe();

      return () => {
        supabase.removeChannel(messagesSubscription);
      };
    }
  }, [chatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!chatRoom) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          text: newMessage.trim(),
          sender_phone: currentUser.phone || currentUser.email || 'unknown'
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Determine message type based on file type
      let messageType: 'image' | 'video' | 'audio' | 'file' = 'file';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('video/')) messageType = 'video';
      else if (file.type.startsWith('audio/')) messageType = 'audio';

      // Send message with file
      const { error } = await supabase
        .from('messages')
        .insert({
          text: `File: ${file.name}`,
          sender_phone: currentUser.phone || currentUser.email || 'unknown'
        });

      if (error) throw error;

      toast({
        title: "File sent successfully",
        description: `${file.name} has been uploaded and sent.`,
      });

    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const getSenderProfile = (senderId: string) => {
    return userProfiles.find(p => p.user_id === senderId);
  };

  const getChatPartner = () => {
    if (chatRoom.is_group) return null;
    // For direct chats, find the other participant
    return userProfiles.find(p => p.user_id !== currentUser.id);
  };

  const chatPartner = getChatPartner();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              {chatPartner?.avatar_url ? (
                <AvatarImage src={chatPartner.avatar_url} alt={chatPartner.display_name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  {getInitials(chatRoom.name)}
                </AvatarFallback>
              )}
            </Avatar>
            {chatPartner?.is_online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{chatRoom.name}</h2>
            <p className="text-sm text-gray-500">
              {chatPartner?.is_online ? "Online" : "Last seen recently"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_phone === (currentUser.phone || currentUser.email)}
                senderName="User"
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0"
          >
            <Smile className="h-5 w-5 text-gray-500" />
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file);
                e.target.value = '';
              }
            }}
            className="hidden"
            multiple={false}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 p-0"
          >
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-10"
          />
          
          {newMessage.trim() ? (
            <Button type="submit" size="sm" className="h-10 px-4">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => setShowVoiceRecorder(true)}
            >
              <Mic className="h-5 w-5 text-gray-500" />
            </Button>
          )}
        </form>
      </div>

      {/* Voice Recorder Modal - TODO: Implement VoiceRecorder component */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p>Voice recording feature coming soon!</p>
            <Button onClick={() => setShowVoiceRecorder(false)} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
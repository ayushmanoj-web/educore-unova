import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft, User, Phone, Video, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  timestamp: string;
  is_read: boolean;
  sender_name?: string;
  sender_class?: string;
  sender_division?: string;
}

interface Teacher {
  id: string;
  name: string;
  class: string;
  division: string;
  created_at: string;
}

const TeacherLiveChat = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      fetchTeacher();
      fetchStudentProfile();
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId && studentProfile) {
      fetchMessages();
      const cleanup = subscribeToMessages();
      return cleanup;
    }
  }, [teacherId, studentProfile]);

  const fetchTeacher = async () => {
    if (!teacherId) return;

    try {
      const { data: teacherData, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (error) {
        throw error;
      }

      setTeacher(teacherData);
    } catch (error) {
      console.error('Error fetching teacher:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher information. Please try again.",
        variant: "destructive",
      });
      navigate('/teacher-chat');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      // Try to get from public_profiles first
      const { data: profiles, error } = await supabase
        .from('public_profiles')
        .select('*')
        .limit(1);

      if (profiles && profiles.length > 0) {
        setStudentProfile(profiles[0]);
      } else {
        // Fallback to localStorage
        const localProfile = localStorage.getItem('student-profile');
        if (localProfile) {
          setStudentProfile(JSON.parse(localProfile));
        }
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  };

  const fetchMessages = async () => {
    if (!teacherId || !studentProfile) return;

    try {
      const { data, error } = await supabase
        .from("messages_chat")
        .select("*")
        .or(`and(sender_id.eq.${studentProfile.id},receiver_id.eq.${teacherId}),and(sender_id.eq.${teacherId},receiver_id.eq.${studentProfile.id})`)
        .order("timestamp", { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    }
  };

  const subscribeToMessages = () => {
    if (!teacherId || !studentProfile) return;

    const channel = supabase
      .channel(`teacher-live-chat-${teacherId}-${studentProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages_chat",
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (
            (newMessage.sender_id === studentProfile.id && newMessage.receiver_id === teacherId) ||
            (newMessage.sender_id === teacherId && newMessage.receiver_id === studentProfile.id)
          ) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !teacher || !studentProfile) return;

    try {
      // Insert into messages_chat for regular chat functionality
      const { error: chatError } = await supabase.from("messages_chat").insert({
        sender_id: studentProfile.id,
        receiver_id: teacherId,
        message_text: newMessage.trim(),
        sender_name: studentProfile.name,
        sender_class: studentProfile.class,
        sender_division: studentProfile.division,
      });

      if (chatError) {
        throw chatError;
      }

      // Also insert into teacher_messages for teacher view
      const { error: teacherError } = await supabase.from("teacher_messages").insert({
        teacher_name: teacher.name,
        teacher_phone: `Teacher ID: ${teacher.id.slice(0, 8)}`,
        student_name: studentProfile.name,
        student_class: studentProfile.class,
        student_division: studentProfile.division,
        student_phone: studentProfile.phone,
        message_text: newMessage.trim(),
      });

      if (teacherError) {
        console.error('Error saving to teacher_messages:', teacherError);
        // Don't throw here as the main chat still works
      }

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-600 mb-2">Teacher Not Found</h2>
          <p className="text-slate-500 mb-6">The teacher profile you're looking for doesn't exist</p>
          <Button onClick={() => navigate('/teacher-chat')} className="bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teachers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/teacher-chat')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {teacher.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-blue-800">{teacher.name}</h1>
              <p className="text-sm text-slate-600">Class {teacher.class} - Division {teacher.division}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="text-green-600">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="text-blue-600">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b bg-white/50 backdrop-blur-sm">
            <CardTitle className="text-lg">Live Chat</CardTitle>
            <p className="text-sm text-slate-600">Connected with {teacher.name}</p>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === studentProfile?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        message.sender_id === studentProfile?.id
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-white text-slate-800 border rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{message.message_text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === studentProfile?.id ? "text-blue-100" : "text-slate-500"
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 rounded-full border-slate-300 focus:border-blue-500"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim()}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                This is a live chat with {teacher.name}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherLiveChat;
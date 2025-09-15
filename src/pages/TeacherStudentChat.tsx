import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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

const TeacherStudentChat = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const studentName = searchParams.get('studentName') || '';
  const studentClass = searchParams.get('studentClass') || '';
  const studentDivision = searchParams.get('studentDivision') || '';
  const studentPhone = searchParams.get('studentPhone') || '';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loggedInTeacher, setLoggedInTeacher] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if teacher is logged in
    const teacherData = localStorage.getItem("teacher-logged-in");
    if (!teacherData) {
      toast({
        title: "Access Denied",
        description: "Please login as a teacher to access chat.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    try {
      const teacher = JSON.parse(teacherData);
      setLoggedInTeacher(teacher);
      fetchMessages(teacher.id);
      const cleanup = subscribeToMessages(teacher.id);
      return cleanup;
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid teacher session. Please login again.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, []);

  const fetchMessages = async (teacherId: string) => {
    // For demo purposes, we'll create mock UUIDs based on the names
    const studentId = 'student-' + btoa(studentName).slice(0, 8) + '-uuid';
    
    try {
      const { data, error } = await supabase
        .from("messages_chat")
        .select("*")
        .or(`and(sender_id.eq.${teacherId},receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.eq.${teacherId})`)
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
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToMessages = (teacherId: string) => {
    const studentId = 'student-' + btoa(studentName).slice(0, 8) + '-uuid';
    
    const channel = supabase
      .channel(`teacher-student-chat-${teacherId}-${studentId}`)
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
            (newMessage.sender_id === teacherId && newMessage.receiver_id === studentId) ||
            (newMessage.sender_id === studentId && newMessage.receiver_id === teacherId)
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
    if (!newMessage.trim() || !loggedInTeacher) return;

    const studentId = 'student-' + btoa(studentName).slice(0, 8) + '-uuid';

    try {
      // Insert into messages_chat for regular chat functionality
      const { error: chatError } = await supabase.from("messages_chat").insert({
        sender_id: loggedInTeacher.id,
        receiver_id: studentId,
        message_text: newMessage.trim(),
        sender_name: loggedInTeacher.name,
        sender_class: loggedInTeacher.class,
        sender_division: loggedInTeacher.division,
      });

      if (chatError) {
        throw chatError;
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

  if (!loggedInTeacher) {
    return (
      <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-300 mb-4 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-600 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">Please login as a teacher to access this chat</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
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
            onClick={() => navigate('/teacher-messages')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-green-100 text-green-600">
                {studentName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-green-800">{studentName}</h1>
              <p className="text-sm text-slate-600">Class {studentClass} - Division {studentDivision}</p>
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
            <CardTitle className="text-lg">Chat with Student</CardTitle>
            <p className="text-sm text-slate-600">Chatting as Teacher: {loggedInTeacher.name}</p>
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
                      message.sender_id === loggedInTeacher?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        message.sender_id === loggedInTeacher?.id
                          ? "bg-green-600 text-white rounded-br-md"
                          : "bg-white text-slate-800 border rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{message.message_text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === loggedInTeacher?.id ? "text-green-100" : "text-slate-500"
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
                  placeholder="Type your reply..."
                  className="flex-1 rounded-full border-slate-300 focus:border-green-500"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim()}
                  className="rounded-full bg-green-600 hover:bg-green-700 text-white px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Replying as Teacher: {loggedInTeacher.name}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherStudentChat;
import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  timestamp: string;
  is_read: boolean;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  phone: string;
}

const TeacherLiveChat = () => {
  const { teacherId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication and get user info
    const teacherSession = localStorage.getItem("teacher-session");
    const studentProfiles = localStorage.getItem("student-profiles");
    
    if (teacherSession) {
      const session = JSON.parse(teacherSession);
      setIsTeacher(true);
      setCurrentUser(session);
      setTeacher(session.teacher);
    } else if (studentProfiles) {
      const profiles = JSON.parse(studentProfiles);
      const latestProfile = profiles[profiles.length - 1];
      setCurrentUser(latestProfile);
      setIsTeacher(false);
      
      // Get teacher info from location state or fetch
      if (location.state?.teacher) {
        setTeacher(location.state.teacher);
      } else {
        // Fetch teacher info based on teacherId
        const teachers = [
          { id: "teacher-1", name: "Asainar Pookkaitha", subject: "Malayalam", phone: "8921463769" },
          { id: "teacher-2", name: "Ranjith Lal", subject: "Malayalam", phone: "9447427171" },
          { id: "teacher-3", name: "Bushara", subject: "Little Kids", phone: "9037209728" },
        ];
        const foundTeacher = teachers.find(t => t.id === teacherId);
        if (foundTeacher) {
          setTeacher(foundTeacher);
        }
      }
    } else {
      // No authentication, redirect back
      navigate("/teacher-chat");
      return;
    }

    if (teacherId) {
      fetchMessages();
      setupRealtime();
    }
  }, [teacherId, location.state, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!teacherId || !currentUser) return;

    const { data, error } = await supabase
      .from("messages_chat")
      .select("*")
      .or(`and(sender_id.eq.${currentUser.phone || currentUser.name},receiver_id.eq.${teacherId}),and(sender_id.eq.${teacherId},receiver_id.eq.${currentUser.phone || currentUser.name})`)
      .order("timestamp", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
      return;
    }

    setMessages(data || []);
  };

  const setupRealtime = () => {
    if (!teacherId) return;

    const channel = supabase
      .channel(`teacher-live-chat-${teacherId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages_chat",
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Add message if it's part of this conversation
          if (
            (newMessage.sender_id === (currentUser?.phone || currentUser?.name) && newMessage.receiver_id === teacherId) ||
            (newMessage.sender_id === teacherId && newMessage.receiver_id === (currentUser?.phone || currentUser?.name))
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
    if (!newMessage.trim() || !teacherId || !currentUser) return;

    const senderId = isTeacher ? teacherId : (currentUser.phone || currentUser.name);
    const receiverId = isTeacher ? (currentUser.phone || currentUser.name) : teacherId;

    const { error } = await supabase.from("messages_chat").insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message_text: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBackNavigation = () => {
    if (isTeacher) {
      localStorage.removeItem("teacher-session");
    }
    navigate("/teacher-chat");
  };

  return (
    <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={handleBackNavigation}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-blue-800">
                {isTeacher ? "Teacher Portal" : "Chat with Teacher"}
              </h1>
              <p className="text-slate-600">
                {teacher?.name} - {teacher?.subject}
              </p>
            </div>
          </div>
        </div>

        <Card className="h-[600px]">
          <CardHeader className="border-b bg-blue-50">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {teacher?.name.split(" ").map((n) => n[0]).join("") || "T"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isTeacher ? "Student Messages" : teacher?.name}
                </CardTitle>
                <p className="text-sm text-slate-600">
                  {isTeacher ? "Messages from students" : teacher?.subject}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col h-[500px] p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMyMessage = isTeacher 
                    ? message.sender_id === teacherId 
                    : message.sender_id === (currentUser?.phone || currentUser?.name);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isMyMessage
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        <p>{message.message_text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type your message as ${isTeacher ? teacher?.name : currentUser?.name}...`}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherLiveChat;
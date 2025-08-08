import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft, Search, MessageSquare, User, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
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
  subject: string;
  phone: string;
}

const TeacherChat = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId] = useState("student-123"); // This would come from auth context
  const [showTeacherAuth, setShowTeacherAuth] = useState(false);
  const [authTeacher, setAuthTeacher] = useState<Teacher | null>(null);
  const [teacherCredentials, setTeacherCredentials] = useState({ name: "", phone: "" });
  const [showViewMessages, setShowViewMessages] = useState(false);
  const [viewMessagesTeacher, setViewMessagesTeacher] = useState<Teacher | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchMessages();
      
      const channel = supabase
        .channel(`messages-${selectedTeacher.id}`)
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
              (newMessage.sender_id === currentUserId && newMessage.receiver_id === selectedTeacher.id) ||
              (newMessage.sender_id === selectedTeacher.id && newMessage.receiver_id === currentUserId)
            ) {
              setMessages((prev) => [...prev, newMessage]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTeacher, currentUserId]);

  const fetchTeachers = async () => {
    const teacherProfiles = [
      { id: "teacher-1", name: "Asainar Pookkaitha", subject: "Malayalam", phone: "8921463769" },
      { id: "teacher-2", name: "Ranjith Lal", subject: "Malayalam", phone: "9447427171" },
      { id: "teacher-3", name: "Bushara", subject: "Little Kids", phone: "9037209728" },
    ];
    setTeachers(teacherProfiles);
  };

  const fetchMessages = async () => {
    if (!selectedTeacher) return;

    const { data, error } = await supabase
      .from("messages_chat")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedTeacher.id}),and(sender_id.eq.${selectedTeacher.id},receiver_id.eq.${currentUserId})`)
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTeacher) return;

    // Get student profile info from localStorage
    const studentProfiles = localStorage.getItem("student-profiles");
    let studentInfo = { name: "Student", class: "", division: "" };
    
    if (studentProfiles) {
      const profiles = JSON.parse(studentProfiles);
      const latestProfile = profiles[profiles.length - 1];
      studentInfo = {
        name: latestProfile.name || "Student",
        class: latestProfile.class || "",
        division: latestProfile.division || ""
      };
    }

    const { error } = await supabase.from("messages_chat").insert({
      sender_id: currentUserId,
      receiver_id: selectedTeacher.id,
      message_text: newMessage.trim(),
      sender_name: studentInfo.name,
      sender_class: studentInfo.class,
      sender_division: studentInfo.division,
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

  const handleTeacherProfile = (teacher: Teacher) => {
    setAuthTeacher(teacher);
    setShowTeacherAuth(true);
    setTeacherCredentials({ name: "", phone: "" });
  };

  const handleViewMessages = async (teacher: Teacher) => {
    setViewMessagesTeacher(teacher);
    setShowViewMessages(true);
    // Fetch messages for this teacher
    const { data } = await supabase
      .from("messages_chat")
      .select("*")
      .eq("receiver_id", teacher.id)
      .order("timestamp", { ascending: false });
    setMessages(data || []);
  };

  const handleTeacherAuth = () => {
    if (!authTeacher) return;
    
    // Validate teacher credentials
    const validCredentials = {
      "Asainar Pookkaitha": "8921463769",
      "Ranjith Lal": "9447427171",
      "Bushara": "9037209728"
    };

    const expectedPhone = validCredentials[teacherCredentials.name as keyof typeof validCredentials];
    
    if (expectedPhone && teacherCredentials.phone === expectedPhone) {
      // Authentication successful - navigate to live chat
      localStorage.setItem("teacher-session", JSON.stringify({
        name: teacherCredentials.name,
        phone: teacherCredentials.phone,
        teacher: authTeacher
      }));
      
      navigate(`/teacher-live-chat/${authTeacher.id}`, { 
        state: { teacher: authTeacher, isTeacher: true } 
      });
      
      setShowTeacherAuth(false);
      toast({
        title: "Authentication Successful",
        description: `Welcome ${teacherCredentials.name}!`,
      });
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid name or phone number. Please check your credentials.",
        variant: "destructive",
      });
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-blue-800">Chat with Teachers</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Teachers List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Your Teachers</CardTitle>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={`w-full p-4 border-l-4 ${
                      selectedTeacher?.id === teacher.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar>
                        <AvatarFallback>
                          {teacher.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{teacher.name}</p>
                        <p className="text-sm text-slate-600">{teacher.subject}</p>
                        <p className="text-xs text-slate-500">Ph: {teacher.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/teacher-live-chat/${teacher.id}`, { 
                          state: { teacher, isTeacher: false } 
                        })}
                        className="flex-1 text-purple-600 hover:text-purple-700"
                      >
                        Live Chat
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTeacherProfile(teacher)}
                        className="flex-1 text-blue-600 hover:text-blue-700"
                      >
                        Teacher Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMessages(teacher)}
                        className="flex-1 text-green-600 hover:text-green-700"
                      >
                        View Messages
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedTeacher ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedTeacher.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedTeacher.name}</CardTitle>
                      <p className="text-sm text-slate-600">{selectedTeacher.subject}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[450px] p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === currentUserId ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === currentUserId
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
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <p className="text-slate-500">Select a teacher to start chatting</p>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Teacher Authentication Modal */}
        <Dialog open={showTeacherAuth} onOpenChange={setShowTeacherAuth}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Teacher Authentication
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Please enter your credentials to access the teacher portal for {authTeacher?.name}.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    value={teacherCredentials.name}
                    onChange={(e) => setTeacherCredentials({...teacherCredentials, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <Input
                    value={teacherCredentials.phone}
                    onChange={(e) => setTeacherCredentials({...teacherCredentials, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowTeacherAuth(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleTeacherAuth} className="flex-1">
                  Login
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Messages Modal */}
        <Dialog open={showViewMessages} onOpenChange={setShowViewMessages}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages to {viewMessagesTeacher?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No messages found for this teacher.</p>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {message.sender_name || "Student"}
                        {message.sender_class && message.sender_division && 
                          ` (${message.sender_class} - ${message.sender_division})`
                        }
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message_text}</p>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TeacherChat;
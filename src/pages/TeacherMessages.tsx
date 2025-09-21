import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageCircle, Phone, Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface TeacherMessage {
  id: string;
  teacher_name: string;
  teacher_phone: string;
  student_name: string;
  student_class: string;
  student_division: string;
  student_phone: string;
  message_text: string;
  timestamp: string;
}

const TeacherMessages: React.FC = () => {
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<TeacherMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInTeacher, setLoggedInTeacher] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if teacher is logged in
    const teacherData = localStorage.getItem("teacher-logged-in");
    if (!teacherData) {
      toast({
        title: "Access Denied",
        description: "Please login as a teacher to view messages.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    try {
      const teacher = JSON.parse(teacherData);
      setLoggedInTeacher(teacher);
      fetchTeacherMessages(teacher.phone);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid teacher session. Please login again.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [navigate]);

  const fetchTeacherMessages = async (teacherPhone: string) => {
    setIsLoading(true);
    try {
      // Fetch from both teacher_messages and messages_chat tables
      const [teacherMessagesResult, chatMessagesResult] = await Promise.all([
        supabase
          .from('teacher_messages')
          .select('*')
          .eq('teacher_phone', teacherPhone)
          .order('timestamp', { ascending: false }),
        supabase
          .from('messages_chat')
          .select('*')
          .eq('receiver_id', loggedInTeacher?.id)
          .order('timestamp', { ascending: false })
      ]);

      if (teacherMessagesResult.error) throw teacherMessagesResult.error;
      if (chatMessagesResult.error) throw chatMessagesResult.error;

      // Combine and format messages
      const combinedMessages = [
        ...(teacherMessagesResult.data || []).map(msg => ({
          id: msg.id,
          teacher_name: msg.teacher_name,
          teacher_phone: msg.teacher_phone,
          student_name: msg.student_name,
          student_class: msg.student_class,
          student_division: msg.student_division,
          student_phone: msg.student_phone,
          message_text: msg.message_text,
          timestamp: msg.timestamp
        })),
        ...(chatMessagesResult.data || []).map(msg => ({
          id: msg.id,
          teacher_name: loggedInTeacher?.name || '',
          teacher_phone: teacherPhone,
          student_name: msg.sender_name || 'Unknown Student',
          student_class: msg.sender_class || '',
          student_division: msg.sender_division || '',
          student_phone: msg.sender_id,
          message_text: msg.message_text,
          timestamp: msg.timestamp
        }))
      ];

      // Remove duplicates and sort by timestamp
      const uniqueMessages = combinedMessages.filter((msg, index, self) => 
        index === self.findIndex(m => m.id === msg.id)
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setMessages(uniqueMessages);
      setFilteredMessages(uniqueMessages);
    } catch (error) {
      console.error('Error fetching teacher messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter messages based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(message =>
        message.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.student_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.student_division.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.message_text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    }
  }, [searchQuery, messages]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!loggedInTeacher) {
    return null;
  }

  return (
    <div className="min-h-screen w-full px-4 py-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/teacher-profile-setup")}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Teacher Profile
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Messages for {loggedInTeacher.name}</h1>
              <p className="text-muted-foreground">Class: {loggedInTeacher.class} | Division: {loggedInTeacher.division}</p>
            </div>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Student Messages
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? 'No Messages Found' : 'No Messages Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'No messages match your search criteria.'
                    : 'Students haven\'t sent any messages to you yet.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Showing {filteredMessages.length} of {messages.length} message{messages.length !== 1 ? 's' : ''} from students
                </div>
                {filteredMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/teacher-student-chat?studentName=${encodeURIComponent(message.student_name)}&studentClass=${encodeURIComponent(message.student_class)}&studentDivision=${encodeURIComponent(message.student_division)}&studentPhone=${encodeURIComponent(message.student_phone)}`)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(message.student_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground">{message.student_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Class: <span className="font-medium">{message.student_class}</span> | 
                              Division: <span className="font-medium">{message.student_division}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(message.timestamp)}
                            </p>
                            <a
                              href={`tel:${message.student_phone}`}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="h-3 w-3" />
                              {message.student_phone}
                            </a>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-md p-3">
                          <p className="text-sm text-foreground">{message.message_text}</p>
                        </div>
                        <div className="mt-2 text-xs text-primary hover:text-primary/80">
                          Click to start conversation with this student
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherMessages;
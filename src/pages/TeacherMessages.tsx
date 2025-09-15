import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
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
      const { data, error } = await supabase
        .from('teacher_messages')
        .select('*')
        .eq('teacher_phone', teacherPhone)
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      setMessages(data || []);
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
    <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
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
          <div>
            <h1 className="text-2xl font-bold text-primary">Messages for {loggedInTeacher.name}</h1>
            <p className="text-muted-foreground">Class: {loggedInTeacher.class}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Student Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                <p className="text-muted-foreground">
                  Students haven't sent any messages to you yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Showing {messages.length} message{messages.length !== 1 ? 's' : ''} from students
                </div>
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/teacher-student-chat?studentName=${encodeURIComponent(message.student_name)}&studentClass=${encodeURIComponent(message.student_class)}&studentDivision=${encodeURIComponent(message.student_division)}&studentPhone=${encodeURIComponent(message.student_phone)}`)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-800">
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
                        <div className="bg-accent/30 rounded-md p-3">
                          <p className="text-sm text-foreground">{message.message_text}</p>
                        </div>
                        <div className="mt-2 text-xs text-primary">
                          Click to reply to this student
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
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Search, MessageCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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

const TeacherMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<TeacherMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInTeacher, setLoggedInTeacher] = useState<any>(null);

  useEffect(() => {
    // Check if teacher is logged in
    const teacherData = localStorage.getItem("teacher-logged-in");
    if (!teacherData) {
      toast({
        title: "Access Denied",
        description: "Please log in as a teacher to view messages.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    try {
      const teacher = JSON.parse(teacherData);
      setLoggedInTeacher(teacher);
      fetchMessages(teacher.phone);
    } catch (error) {
      console.error("Error parsing teacher data:", error);
      navigate("/");
    }
  }, [navigate]);

  const fetchMessages = async (teacherPhone: string) => {
    setIsLoading(true);
    try {
      // First try to get from teacher_messages table
      const { data: teacherMessages, error: teacherError } = await supabase
        .from('teacher_messages')
        .select('*')
        .eq('teacher_phone', teacherPhone)
        .order('timestamp', { ascending: false });

      if (teacherError) {
        console.error('Error fetching from teacher_messages:', teacherError);
      }

      // Also get from messages_chat table for legacy support
      const { data: chatMessages, error: chatError } = await supabase
        .from('messages_chat')
        .select('*')
        .order('timestamp', { ascending: false });

      if (chatError) {
        console.error('Error fetching from messages_chat:', chatError);
      }

      // Combine and format messages
      const allMessages: TeacherMessage[] = [];
      
      // Add teacher-specific messages
      if (teacherMessages) {
        allMessages.push(...teacherMessages);
      }

      // Add chat messages that are relevant to the teacher (filter by class if available)
      if (chatMessages) {
        const relevantChatMessages = chatMessages
          .filter(msg => {
            // Filter based on teacher's class if available
            if (loggedInTeacher?.class) {
              return msg.sender_class?.toLowerCase().includes(loggedInTeacher.class.toLowerCase());
            }
            return true; // Show all if no specific class
          })
          .map(msg => ({
            id: msg.id,
            teacher_name: loggedInTeacher?.name || 'Teacher',
            teacher_phone: teacherPhone,
            student_name: msg.sender_name || 'Unknown Student',
            student_class: msg.sender_class || 'Unknown',
            student_division: msg.sender_division || 'Unknown',
            student_phone: 'N/A',
            message_text: msg.message_text,
            timestamp: msg.timestamp
          }));
        
        allMessages.push(...relevantChatMessages);
      }

      // Remove duplicates and sort by timestamp
      const uniqueMessages = allMessages
        .filter((message, index, self) => 
          index === self.findIndex(m => m.id === message.id)
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setMessages(uniqueMessages);
      setFilteredMessages(uniqueMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery) {
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

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  Teacher Messages
                </CardTitle>
                {loggedInTeacher && (
                  <p className="text-blue-100 text-sm mt-1">
                    Logged in as: {loggedInTeacher.name} ({loggedInTeacher.class})
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search messages by student name, class, division, or message content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Messages List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No messages found</p>
                <p className="text-gray-500 text-sm">
                  {searchQuery ? "Try adjusting your search terms" : "No students have sent messages yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-sm text-green-600 mb-4">
                  Showing {filteredMessages.length} of {messages.length} messages
                </div>
                
                {filteredMessages.map((message) => (
                  <Card key={message.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {getInitials(message.student_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {message.student_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Class: <span className="font-medium">{message.student_class}</span> | 
                                Division: <span className="font-medium">{message.student_division}</span>
                              </p>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTimestamp(message.timestamp)}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-800">{message.message_text}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherMessagesPage;
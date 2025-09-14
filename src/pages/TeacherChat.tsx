import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, ArrowLeft, Search, Upload } from "lucide-react";
import { Link } from "react-router-dom";
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

const TeacherChat = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId] = useState("student-123"); // This would come from auth context
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
    fetchStudentProfile();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedTeacher]);

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

  const fetchTeachers = async () => {
    const teacherProfiles = [
      { id: "teacher-1", name: "Asainar Pookkaitha", subject: "Mathematics", phone: "8921463769" },
      { id: "teacher-2", name: "Ranjith Lal", subject: "Science", phone: "9447427171" },
      { id: "teacher-3", name: "Bushara Lt", subject: "English", phone: "9037209728" },
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

  const subscribeToMessages = () => {
    if (!selectedTeacher) return;

    const channel = supabase
      .channel("messages-changes")
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
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTeacher || !studentProfile) return;

    try {
      // Insert into messages_chat for regular chat functionality
      const { error: chatError } = await supabase.from("messages_chat").insert({
        sender_id: currentUserId,
        receiver_id: selectedTeacher.id,
        message_text: newMessage.trim(),
      });

      if (chatError) {
        throw chatError;
      }

      // Also insert into teacher_messages for teacher view
      const { error: teacherError } = await supabase.from("teacher_messages").insert({
        teacher_name: selectedTeacher.name,
        teacher_phone: selectedTeacher.phone,
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

        <div className="flex items-center justify-center h-[400px]">
          <p className="text-slate-500 text-lg">This section has been removed</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherChat;
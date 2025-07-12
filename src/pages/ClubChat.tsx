import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, MessageCircle, Trash2 } from "lucide-react";

interface ClubMessage {
  id: string;
  sender_name: string;
  sender_image: string;
  message: string;
  timestamp: string;
}

const ClubChat = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const clubName = location.state?.clubName || "Club";
  const studentData = JSON.parse(localStorage.getItem('studentProfile') || '{}');

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [clubId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('club_chat_messages')
        .select('*')
        .eq('club_id', clubId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('club_chat_messages')
        .insert({
          club_id: clubId,
          sender_id: studentData.id || 'temp-id',
          sender_name: studentData.name,
          sender_image: studentData.image,
          message: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleClearAllMessages = async () => {
    try {
      const { error } = await supabase
        .from('club_chat_messages')
        .delete()
        .eq('club_id', clubId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "All messages cleared successfully",
      });
      
      setMessages([]);
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast({
        title: "Error",
        description: "Failed to clear messages",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/club-application/${clubId}`, { 
                state: { clubName } 
              })}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Club
            </Button>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <MessageCircle className="h-8 w-8" />
              {clubName} Chat
            </h1>
          </div>
          
          <Button
            variant="destructive"
            onClick={handleClearAllMessages}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Club Discussion</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_name === studentData.name ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_name === studentData.name
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender_image && (
                        <img 
                          src={message.sender_image} 
                          alt={message.sender_name}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm font-medium">{message.sender_name}</span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type your message in ${clubName}...`}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
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

export default ClubChat;
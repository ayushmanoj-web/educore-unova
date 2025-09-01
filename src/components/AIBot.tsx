
import React, { useState } from "react";
import { Bot, Minimize2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const AIBot: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);

  type ChatMessage = { role: 'user' | 'assistant'; content: string };

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm Edudevadar AI. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState("chatgpt");

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('edudevadar-ai', {
        body: { messages: [...messages, userMsg], model: selectedModel }
      });
      if (error) throw error;
      const reply = data?.generatedText || "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error('Edudevadar AI error:', e);
      setMessages((prev) => [...prev, { role: 'assistant', content: "I ran into an issue. Please try again." }]);
    } finally {
      setIsSending(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
             onClick={() => setIsMinimized(false)}>
          <Bot className="h-8 w-8 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-96 h-[600px] shadow-2xl flex flex-col rounded-3xl overflow-hidden border-2 border-gradient-to-br from-blue-500 to-purple-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-3xl">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            Edudevadar AI
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${m.role === 'assistant' ? 'bg-blue-50 text-blue-900' : 'bg-slate-100 text-slate-800'}`}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t bg-white space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Model:</span>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chatgpt">ChatGPT</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Edudevadar AI..."
                aria-label="Message Edudevadar AI"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button type="submit" disabled={isSending || !input.trim()} className="rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default AIBot;

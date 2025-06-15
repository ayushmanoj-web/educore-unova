
import React, { useRef, useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  text: string;
  role: "user" | "ai";
};

const AIChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      text: "Hi! Ask me anything about Clever Kids Club.",
      role: "ai",
    },
  ]);
  const nextId = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: nextId.current++, text: trimmed, role: "user" };
    const aiMsg: ChatMessage = {
      id: nextId.current++,
      text: `You said: ${trimmed}`,
      role: "ai",
    };
    setMessages(msgs => [...msgs, userMsg, aiMsg]);
    setInput("");
  };

  React.useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 z-50 rounded-full shadow-lg border bg-white hover:bg-blue-50 text-blue-700 animate-fade-in",
            open ? "opacity-0 pointer-events-none" : ""
          )}
          aria-label="Open AI Chat"
        >
          <Bot />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="p-0 overflow-hidden rounded-2xl shadow-2xl fixed bottom-24 right-6 w-full max-w-sm bg-white flex flex-col"
        style={{ maxHeight: 540, minHeight: 440 }}
      >
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 border-b bg-slate-50">
          <Bot className="text-blue-700" />
          <span className="font-semibold text-blue-800 text-base">Clever Kids AI</span>
          <div className="ml-auto text-xs text-slate-400">ChatGPT Helper</div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-white via-blue-50 to-white space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg max-w-[80%] text-base transition-colors",
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-slate-100 text-slate-800 rounded-bl-md"
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={sendMessage}
          className="flex gap-2 p-3 border-t bg-white"
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your question..."
            className="text-base"
            autoFocus={open}
            maxLength={200}
            aria-label="Type your message"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            aria-label="Send"
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            <Send size={20} />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatWidget;


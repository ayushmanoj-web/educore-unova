
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";

type Message = {
  id: string;
  sender_phone: string;
  text: string | null;
  audio_url: string | null;
  timestamp: string;
};

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ChatBox: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState<string>(() => {
    // Try to get a "phone" from localStorage (for simplicity in demo)
    return localStorage.getItem("chat_phone") || "";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Load initial messages
  useEffect(() => {
    let mounted = true;
    supabase
      .from("messages")
      .select("*")
      .order("timestamp", { ascending: true })
      .then((res) => {
        if (mounted && res.data) setMessages(res.data as Message[]);
      });
    // Subscribe to new message inserts:
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Minimal phone name (not real auth)
  function handlePhoneSave(e: React.FormEvent) {
    e.preventDefault();
    if (phone.trim()) {
      localStorage.setItem("chat_phone", phone);
    }
  }

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || !phone.trim()) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      text: input.slice(0, 200), // Limit length
      sender_phone: phone,
    });
    setSending(false);
    setInput("");
    if (error) {
      alert("Could not send message.");
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-40 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl p-4 text-white flex items-center gap-2 transition-all md:bottom-8 md:right-10"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <MessageSquare className="mr-1" />
          Chat
        </button>
      )}
      {/* Chat Dialog */}
      {open && (
        <div className="fixed bottom-4 right-4 sm:right-8 z-50 w-[88vw] max-w-xs md:max-w-sm bg-white border shadow-xl rounded-xl flex flex-col animate-in fade-in">
          <div className="flex items-center justify-between gap-2 p-3 border-b">
            <span className="font-semibold text-blue-700 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Live Chat
            </span>
            <button className="text-slate-400 hover:text-slate-900" onClick={() => setOpen(false)} aria-label="Close chat">&times;</button>
          </div>
          <div className="flex-1 min-h-[200px] bg-blue-50/60 flex flex-col">
            {phone ? (
              <ScrollArea className="flex-1 px-2 py-1" style={{ maxHeight: 320 }}>
                <div>
                  {messages.length === 0 && (
                    <div className="text-center mt-10 text-slate-400 text-sm">No messages yet.</div>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`my-1 flex flex-col items-${m.sender_phone === phone ? "end" : "start"}`}
                    >
                      <div
                        className={`rounded-xl px-3 py-2 text-sm shadow-sm break-words max-w-[83%] ${
                          m.sender_phone === phone
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white border rounded-bl-md"
                        }`}
                        title={m.sender_phone}
                      >
                        {m.text}
                      </div>
                      <span className="text-xs text-slate-400 px-1">
                        {m.sender_phone === phone ? "You" : m.sender_phone} · {formatTime(m.timestamp)}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            ) : (
              <form className="p-6" onSubmit={handlePhoneSave}>
                <label className="block mb-2 text-sm font-semibold text-slate-600">Enter your name/phone:</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="E.g. 123-456 or your name"
                  maxLength={32}
                />
                <Button type="submit" className="mt-3 w-full">Continue</Button>
              </form>
            )}
          </div>
          {phone && (
            <form onSubmit={sendMessage} className="flex gap-1 px-3 py-2 border-t items-center bg-white">
              <Input
                className="flex-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                maxLength={200}
                disabled={sending}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) sendMessage(e); }}
              />
              <Button
                type="submit"
                size="icon"
                variant="secondary"
                className="ml-1"
                disabled={sending || !input.trim()}
                aria-label="Send message"
              >
                <Send size={18} />
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox;

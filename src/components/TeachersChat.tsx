
import React, { useRef, useState, useEffect } from "react";
import { Send, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import VoiceRecorderButton from "./VoiceRecorderButton";

type Message = {
  id: number;
  text?: string;
  audioUrl?: string;
  sender: "me" | "other";
  senderName: string;
  timestamp: Date;
};

const sampleUsers = [
  { sender: "other" as const, senderName: "Ms. Smith" },
  { sender: "other" as const, senderName: "Alex" },
  { sender: "other" as const, senderName: "Taylor" },
];

const myName = "You"; // could be dynamic per user in real app

const TeachersChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to the Class Group Chat! 👋",
      sender: "other",
      senderName: "Ms. Smith",
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "Feel free to ask questions and share your updates here.",
      sender: "other",
      senderName: "Ms. Smith",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const msgEndRef = useRef<HTMLDivElement | null>(null);

  // (Fake) Simulate random messages from others for demo
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messages.length < 10 && Math.random() > 0.6) {
        const randUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        setMessages((msgs) => [
          ...msgs,
          {
            id: messages.length + 1,
            text: 
              randUser.senderName === "Alex"
                ? "When is the next test?"
                : randUser.senderName === "Taylor"
                  ? "Here's my volcano model photo 📷"
                  : "Remember: bring your science project Monday!",
            sender: randUser.sender,
            senderName: randUser.senderName,
            timestamp: new Date(),
          },
        ]);
      }
    }, 5000 + Math.random() * 5000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const newMsg: Message = {
      id: messages.length + 1,
      text,
      sender: "me",
      senderName: myName,
      timestamp: new Date(),
    };
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");
  };

  const handleSendAudio = (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const newMsg: Message = {
      id: messages.length + 1,
      audioUrl,
      sender: "me",
      senderName: myName,
      timestamp: new Date(),
    };
    setMessages((msgs) => [...msgs, newMsg]);
    // You can revokeObjectURL after component unmounts if needed.
  };

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow animate-fade-in max-h-[420px] min-h-[340px] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
        <Users className="text-blue-800" />
        <span className="font-semibold text-blue-900">Class Group Chat</span>
        <span className="ml-auto text-xs text-slate-400">For Teachers & Students</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 bg-gradient-to-b from-blue-50 via-white to-blue-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "mb-1 flex",
              msg.sender === "me" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-3 py-2 max-w-[75%] text-base",
                msg.sender === "me"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-slate-100 text-slate-800 rounded-bl-md"
              )}
            >
              {msg.audioUrl ? (
                <audio controls src={msg.audioUrl} className="w-full mb-1 rounded" preload="auto">
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <span className="block">{msg.text}</span>
              )}
              <span className="block text-xs opacity-60 mt-0.5">
                {msg.senderName} •{" "}
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={msgEndRef} />
      </div>
      <form
        className="flex gap-2 p-2 border-t bg-white"
        onSubmit={handleSend}
      >
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={180}
          autoComplete="off"
          className="text-base"
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) handleSend(e);
          }}
          aria-label="Chat message text"
        />
        <VoiceRecorderButton onSend={handleSendAudio} disabled={false} />
        <Button
          type="submit"
          size="icon"
          className="bg-blue-700 text-white hover:bg-blue-800"
          aria-label="Send"
          disabled={!input.trim()}
        >
          <Send size={20} />
        </Button>
      </form>
    </div>
  );
};

export default TeachersChat;

import React, { useRef, useState, useEffect } from "react";
import { Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import VoiceRecorderButton from "./VoiceRecorderButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Profile = {
  name: string;
  class: string;
  division: string;
  dob: string;
  phone: string;
  image?: string;
};

type Message = {
  id: number;
  text?: string;
  audioUrl?: string;
  senderPhone: string; // sender's phone for matching avatar/info
  timestamp: Date;
};

const LOCAL_STORAGE_KEY = "student-profiles";

// Util to get the current user (last profile in localStorage)
function getCurrentUser(): Profile | undefined {
  const profiles = getStoredProfiles();
  if (profiles.length === 0) return undefined;
  return profiles[profiles.length - 1];
}

function getStoredProfiles(): Profile[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Util to get initials from name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

// No welcome/system messages: only user content from here on!
const TeachersChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const msgEndRef = useRef<HTMLDivElement | null>(null);

  // Keep profile info in chat
  const [profiles, setProfiles] = useState<Profile[]>(() => getStoredProfiles());
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Reload latest profiles if changed outside
    const handle = () => setProfiles(getStoredProfiles());
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // When a new profile is added, reload chat user info
  useEffect(() => {
    setProfiles(getStoredProfiles());
  }, []);

  // Submit text message
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || !currentUser) return;
    setMessages((msgs) => [
      ...msgs,
      {
        id: msgs.length + 1,
        text,
        senderPhone: currentUser.phone,
        timestamp: new Date(),
      }
    ]);
    setInput("");
  };

  // Handle audio
  const handleSendAudio = (audioBlob: Blob) => {
    if (!currentUser) return;
    const audioUrl = URL.createObjectURL(audioBlob);
    setMessages((msgs) => [
      ...msgs,
      {
        id: msgs.length + 1,
        audioUrl,
        senderPhone: currentUser.phone,
        timestamp: new Date(),
      }
    ]);
  };

  // Get profile info for message sender
  function getProfile(phone: string): Profile | undefined {
    return profiles.find((p) => p.phone === phone);
  }

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow animate-fade-in max-h-[420px] min-h-[340px] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
        <Users className="text-blue-800" />
        <span className="font-semibold text-blue-900">Class Group Chat</span>
        <span className="ml-auto text-xs text-slate-400">For Teachers & Students</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 bg-gradient-to-b from-blue-50 via-white to-blue-50">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-slate-400 mt-10">
            Start the conversation by sending a message!
          </div>
        ) : (
          messages.map((msg) => {
            const senderProfile = getProfile(msg.senderPhone);
            const isMe = currentUser && senderProfile && senderProfile.phone === currentUser.phone;
            if (!senderProfile) return null; // Hide messages if no profile (extra safety, shouldn't happen)
            return (
              <div
                key={msg.id}
                className={cn(
                  "mb-2 flex w-full",
                  // always align avatar left, bubble placement adjusts if user
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                {/* Avatar + name column */}
                <div className="flex flex-col items-center mr-2 min-w-[48px]">
                  <Avatar className="w-7 h-7 shrink-0 mb-1">
                    {senderProfile.image ? (
                      <AvatarImage src={senderProfile.image} alt={senderProfile.name} />
                    ) : (
                      <AvatarFallback>
                        {getInitials(senderProfile?.name || "U")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="block text-xs text-center text-gray-700 max-w-[48px] truncate">
                    {senderProfile.name}
                  </span>
                </div>
                {/* Message bubble */}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-[75%] text-base flex flex-col shadow-sm",
                    isMe
                      ? "bg-blue-600 text-white rounded-br-md ml-auto"
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
                  <span className={cn(
                    "block text-xs opacity-60 mt-0.5 text-right",
                    isMe ? "text-white/70" : "text-gray-500"
                  )}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
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
        <VoiceRecorderButton onSend={handleSendAudio} disabled={!currentUser} />
        <Button
          type="submit"
          size="icon"
          className="bg-blue-700 text-white hover:bg-blue-800"
          aria-label="Send"
          disabled={!input.trim() || !currentUser}
        >
          <Send size={20} />
        </Button>
      </form>
    </div>
  );
};

export default TeachersChat;

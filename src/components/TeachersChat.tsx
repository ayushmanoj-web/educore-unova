
import React, { useRef, useState, useEffect } from "react";
import { Send, Users, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import VoiceRecorderButton from "./VoiceRecorderButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Type definitions
type Profile = {
  name: string;
  class: string;
  division: string;
  dob: string;
  phone: string;
  image?: string;
};

type Message = {
  id: string;
  text?: string | null;
  audio_url?: string | null;
  sender_phone: string;
  timestamp: string;
  pending?: boolean; // local, not from server
};

// Util to get current user (last profile in localStorage)
function getStoredProfiles(): Profile[] {
  try {
    const data = localStorage.getItem("student-profiles");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getCurrentUser(): Profile | undefined {
  const profiles = getStoredProfiles();
  if (profiles.length === 0) return undefined;
  return profiles[profiles.length - 1];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

// Helper for optimistic id
function genTempId() {
  return "temp_" + Math.random().toString(36).slice(2) + "_" + Date.now();
}

const TeachersChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const msgEndRef = useRef<HTMLDivElement | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>(() => getStoredProfiles());
  const [supabaseProfiles, setSupabaseProfiles] = useState<Profile[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const currentUser = getCurrentUser();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      console.log("Authentication status:", !!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      console.log("Auth state changed:", !!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profiles from Supabase
  useEffect(() => {
    const fetchSupabaseProfiles = async () => {
      console.log("Fetching Supabase profiles, authenticated:", isAuthenticated);
      
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching profiles from Supabase:', error);
        return;
      }

      if (profilesData) {
        const formattedProfiles: Profile[] = profilesData.map(profile => ({
          name: profile.name,
          class: profile.class || '',
          division: profile.division || '',
          dob: profile.dob || '',
          phone: profile.phone,
          image: profile.image || undefined,
        }));
        setSupabaseProfiles(formattedProfiles);
        console.log("Loaded profiles from Supabase:", formattedProfiles);
      }
    };

    fetchSupabaseProfiles();
  }, [isAuthenticated]);

  // Combine all profiles
  useEffect(() => {
    const localProfiles = getStoredProfiles();
    const combined = [...localProfiles, ...supabaseProfiles];
    
    // Remove duplicates based on phone number
    const uniqueProfiles = combined.reduce((acc: Profile[], current) => {
      const existingProfile = acc.find(p => p.phone === current.phone);
      if (!existingProfile) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    setAllProfiles(uniqueProfiles);
    console.log("Combined profiles:", uniqueProfiles);
  }, [profiles, supabaseProfiles]);

  // Fetch messages from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchMessages() {
      console.log("Fetching messages from Supabase...");
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("timestamp", { ascending: true });

      if (!isMounted) return;
      if (error) {
        console.error("Failed to load messages:", error);
        toast({
          title: "Error loading messages",
          description: "Could not load chat history",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Loaded messages:", data);
      setMessages(
        (data ?? []).map((m: any) => ({
          ...m,
          timestamp: typeof m.timestamp === "string"
            ? m.timestamp
            : new Date(m.timestamp).toISOString(),
        })) as Message[]
      );
    }
    fetchMessages();

    return () => { isMounted = false };
  }, []);

  // Listen to realtime changes (INSERT ONLY - new messages)
  useEffect(() => {
    console.log("Setting up realtime subscription...");
    const channel = supabase
      .channel('public:messages')
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          console.log("New message received via realtime:", payload.new);
          const m = payload.new;
          // Remove matching temp (pending) message if exists, then add this real one
          setMessages((prev) => {
            // If already in, don't add
            if (prev.some(msg => msg.id === m.id)) return prev;
            let filteredPrev = prev;
            // Remove pending optimistic message with same sender/text/timestamp (only for this user)
            if (currentUser && m.sender_phone === currentUser.phone && m.text) {
              filteredPrev = prev.filter(msg =>
                !(
                  msg.pending &&
                  msg.sender_phone === m.sender_phone &&
                  msg.text === m.text &&
                  // timestamps can have ms diff, loosen check (just same minute)
                  Math.abs(new Date(msg.timestamp).getTime() - new Date(m.timestamp).getTime()) < 60000
                )
              );
            }
            return [
              ...filteredPrev,
              {
                ...m,
                timestamp: typeof m.timestamp === "string"
                  ? m.timestamp
                  : new Date(m.timestamp).toISOString()
              } as Message,
            ];
          });
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  useEffect(() => {
    const handle = () => {
      console.log("Storage event detected, updating profiles");
      setProfiles(getStoredProfiles());
    };
    window.addEventListener("storage", handle);
    return () => window.removeEventListener("storage", handle);
  }, []);

  useEffect(() => {
    setProfiles(getStoredProfiles());
  }, []);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // The correct type for Supabase insert
  type MessageInsert = {
    text?: string | null;
    audio_url?: string | null;
    sender_phone: string;
    timestamp?: string;
  };

  async function addMessageToSupabase(content: MessageInsert) {
    console.log("Sending message to Supabase:", content);
    const { error } = await supabase
      .from("messages")
      .insert([content]);
    if (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log("Message sent successfully");
    }
    // Real-time will update state automatically.
  }

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || !currentUser) {
      if (!currentUser) {
        toast({
          title: "Profile required",
          description: "Please set up your profile first",
          variant: "destructive",
        });
      }
      return;
    }
    
    // Generate a temp message for instant optimistic UI
    const nowIso = new Date().toISOString();
    const tempMsg: Message = {
      id: genTempId(),
      text,
      audio_url: undefined,
      sender_phone: currentUser.phone,
      timestamp: nowIso,
      pending: true,
    };
    setMessages(prev => [...prev, tempMsg]);
    setInput("");
    await addMessageToSupabase({
      text,
      sender_phone: currentUser.phone,
      timestamp: nowIso
    });
  };

  // Optimistically show audio message immediately after recording stops & before upload
  const handleSendAudio = async (audioBlob: Blob) => {
    if (!currentUser) return;
    const nowIso = new Date().toISOString();
    // Use a FileReader to convert to base64 for immediate preview/playback (still pending)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      // Optimistically add message before upload to Supabase
      const tempMsg: Message = {
        id: genTempId(),
        audio_url: typeof base64 === "string" ? base64 : undefined,
        text: undefined,
        sender_phone: currentUser.phone,
        timestamp: nowIso,
        pending: true,
      };
      setMessages(prev => [...prev, tempMsg]);
      // Now upload to Supabase in background
      await addMessageToSupabase({
        audio_url: typeof base64 === "string" ? base64 : undefined,
        sender_phone: currentUser.phone,
        timestamp: nowIso
      });
    };
    reader.readAsDataURL(audioBlob);
  };

  function getProfile(phone: string): Profile | undefined {
    console.log("Looking for profile with phone:", phone);
    console.log("Available profiles:", allProfiles);
    
    const profile = allProfiles.find((p) => p.phone === phone);
    
    if (!profile) {
      console.warn("No profile found for phone:", phone);
      // Return a default profile to prevent crashes
      return {
        name: phone.slice(-4) || "Unknown", // Use last 4 digits as fallback name
        class: "",
        division: "",
        dob: "",
        phone: phone,
      };
    }
    
    console.log("Found profile:", profile);
    return profile;
  }

  // Helper to delete message from Supabase and then from state
  async function handleDeleteMessage(message: Message) {
    setDeletingMessageId(message.id);

    // Only allow deleting own message
    if (!currentUser || message.sender_phone !== currentUser.phone) {
      toast({
        title: "Can't delete",
        description: "You can only delete your own messages.",
        variant: "destructive",
      });
      setDeletingMessageId(null);
      return;
    }
    // Prevent deleting pending/optimistic messages (not yet saved)
    if (message.pending) {
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      setSelectedMessageId(null);
      setDeletingMessageId(null);
      return;
    }

    const { error } = await supabase.from("messages").delete().eq("id", message.id);
    if (error) {
      toast({
        title: "Failed to delete message",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Remove message locally (realtime will also update)
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      toast({
        title: "Message deleted",
      });
    }
    setSelectedMessageId(null);
    setDeletingMessageId(null);
  }

  // Detect outside click to close delete button
  useEffect(() => {
    if (!selectedMessageId) return;
    function handleClick(e: MouseEvent) {
      // Only close if clicked outside any message
      const el = document.getElementById(`chat-msg-${selectedMessageId}`);
      if (el && !el.contains(e.target as Node)) {
        setSelectedMessageId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selectedMessageId]);

  // To avoid duplicates: sort by timestamp & filter out duplicate ids
  const displayedMessages = React.useMemo(() => {
    // Remove duplicate by id (last wins)
    const map = new Map<string, Message>();
    messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .forEach(msg => { map.set(msg.id, msg); });
    return Array.from(map.values());
  }, [messages]);

  if (!currentUser) {
    return (
      <div className="flex flex-col rounded-xl border bg-white shadow animate-fade-in max-h-[420px] min-h-[340px] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
          <Users className="text-blue-800" />
          <span className="font-semibold text-blue-900">Class Group Chat</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Please set up your profile first</p>
            <p className="text-sm text-gray-500">Go to Profile page to create your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border bg-white shadow animate-fade-in max-h-[420px] min-h-[340px] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
        <Users className="text-blue-800" />
        <span className="font-semibold text-blue-900">Class Group Chat</span>
        <span className="ml-auto text-xs text-slate-400">
          {allProfiles.length} profiles loaded
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 bg-gradient-to-b from-blue-50 via-white to-blue-50">
        {displayedMessages.length === 0 ? (
          <div className="text-center text-sm text-slate-400 mt-10">
            Start the conversation by sending a message!
          </div>
        ) : (
          displayedMessages.map((msg) => {
            const senderProfile = getProfile(msg.sender_phone);
            const isMe = currentUser && senderProfile && senderProfile.phone === currentUser.phone;
            const isSelected = selectedMessageId === msg.id;
            
            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={cn(
                  "mb-2 flex w-full relative group",
                  isMe ? "justify-end" : "justify-start"
                )}
                tabIndex={0}
                onClick={() => setSelectedMessageId(msg.id)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") setSelectedMessageId(msg.id);
                }}
                style={{ outline: isSelected ? "2px solid #3b82f6" : "none", borderRadius: 8 }}
              >
                {/* Delete button appears above message when selected and it's user's own message */}
                {isSelected && isMe && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 shadow-lg"
                    aria-label="Delete message"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteMessage(msg);
                    }}
                    disabled={deletingMessageId === msg.id}
                  >
                    <Delete size={18} />
                  </Button>
                )}
                <div className="flex flex-col items-center mr-2 min-w-[48px]">
                  <Avatar className="w-7 h-7 shrink-0 mb-1">
                    {senderProfile?.image ? (
                      <AvatarImage src={senderProfile.image} alt={senderProfile.name} />
                    ) : (
                      <AvatarFallback>
                        {getInitials(senderProfile?.name || "U")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="block text-xs text-center text-gray-700 max-w-[48px] truncate">
                    {senderProfile?.name || "Unknown"}
                  </span>
                </div>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-[75%] text-base flex flex-col shadow-sm",
                    isMe
                      ? "bg-blue-600 text-white rounded-br-md ml-auto"
                      : "bg-slate-100 text-slate-800 rounded-bl-md",
                    msg.pending && "opacity-60 animate-pulse"
                  )}
                >
                  {msg.audio_url ? (
                    <audio controls src={msg.audio_url ?? undefined} className="w-full mb-1 rounded" preload="auto">
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <span className="block">{msg.text}</span>
                  )}
                  <span className={cn(
                    "block text-xs opacity-60 mt-0.5 text-right",
                    isMe ? "text-white/70" : "text-gray-500"
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.pending ? <span className="ml-1 text-xs italic">sending…</span> : null}
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

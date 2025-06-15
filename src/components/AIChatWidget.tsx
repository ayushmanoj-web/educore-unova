
import React, { useRef, useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Send, Bot, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  text: string;
  role: "user" | "ai";
  // Optional for streaming
  isStreaming?: boolean;
};

const LOCAL_STORAGE_KEY = "OPENAI_API_KEY";

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
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(LOCAL_STORAGE_KEY) || "");
  const [isSettingKey, setIsSettingKey] = useState(!localStorage.getItem(LOCAL_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(false);
  const nextId = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // OpenAI API chat call
  async function fetchChatGPTReply(chatMessages: ChatMessage[], apiKey: string) {
    // Format messages
    const formatted = chatMessages
      .filter(m => m.role === "user" || m.role === "ai")
      .map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text,
      }));

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: formatted,
          temperature: 0.6,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        throw new Error(`API error: ${errText}`);
      }

      // Streaming response
      let buffer = "";
      const reader = response.body.getReader();

      let aiMsgId = nextId.current++;
      setMessages((msgs) => [
        ...msgs,
        { id: aiMsgId, text: "", role: "ai", isStreaming: true },
      ]);

      let done = false;
      let fullText = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (value) {
          buffer += new TextDecoder().decode(value);

          // Parse chunks (OpenAI SSE chunked responses)
          const lines = buffer
            .split("\n")
            .map(line => line.trim())
            .filter(line => line !== "");

          buffer = lines.length && !lines[lines.length - 1].endsWith("}") ? lines.pop() || "" : "";

          for (let line of lines) {
            if (line.startsWith("data: ")) line = line.slice(6);
            if (line === "[DONE]") done = true;
            else if (line) {
              try {
                const json = JSON.parse(line);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  fullText += content;
                  setMessages(msgs =>
                    msgs.map(m =>
                      m.id === aiMsgId
                        ? { ...m, text: fullText, isStreaming: true }
                        : m
                    )
                  );
                }
              } catch {}
            }
          }
        }
        if (doneReading) break;
      }
      // Finish streaming
      setMessages(msgs =>
        msgs.map(m =>
          m.id === aiMsgId
            ? { ...m, isStreaming: false }
            : m
        )
      );
    } catch (err: any) {
      setMessages(msgs => [
        ...msgs,
        {
          id: nextId.current++,
          text: "Sorry, there was an error connecting to OpenAI's API. Check your API key.",
          role: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const sendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading || isSettingKey) return;
    const userMsg: ChatMessage = { id: nextId.current++, text: trimmed, role: "user" };
    setMessages(msgs => [...msgs, userMsg]);
    setInput("");
    setIsLoading(true);
    fetchChatGPTReply([...messages, userMsg], apiKey);
  };

  // Save API Key
  const handleSaveKey = () => {
    if (!apiKey.startsWith("sk-") || apiKey.length < 40) return;
    localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);
    setIsSettingKey(false);
  };

  // Remove API Key
  const handleLogoutKey = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setApiKey("");
    setIsSettingKey(true);
  };

  React.useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, isLoading]);

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

        {/* API Key input UI */}
        {isSettingKey ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 gap-4">
            <KeyRound className="w-8 h-8 text-blue-400 mb-2 mt-6" />
            <div className="text-slate-700 text-center text-base font-medium">
              Enter your OpenAI API Key
            </div>
            <Input
              autoFocus
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full"
              maxLength={60}
              spellCheck={false}
            />
            <Button
              className="w-full bg-blue-700 text-white hover:bg-blue-800"
              onClick={handleSaveKey}
              disabled={!apiKey.startsWith("sk-") || apiKey.length < 40}
            >
              Save API Key
            </Button>
            <div className="text-xs text-slate-400 text-center leading-tight pb-2">
              Find your key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="underline hover:text-blue-700">platform.openai.com/api-keys</a>
              <br />
              Your key is stored ONLY in your browser.
            </div>
          </div>
        ) : (
        <>
          <div className="flex justify-between items-center px-4 pt-2 pb-1">
            <div />
            <Button onClick={handleLogoutKey} variant="outline" size="sm" className="text-xs px-2 py-1 h-6 border-slate-300">
              Change API Key
            </Button>
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
                      : "bg-slate-100 text-slate-800 rounded-bl-md",
                    msg.isStreaming ? "animate-pulse" : ""
                  )}
                >
                  {msg.text}
                  {/* Show blinking cursor during stream */}
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 rounded bg-slate-300 align-middle animate-blink" style={{ verticalAlign: "middle" }}/>
                  )}
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
              placeholder={isLoading ? "Waiting for response..." : "Ask your question..."}
              className="text-base"
              autoFocus={open && !isSettingKey}
              maxLength={200}
              disabled={isLoading}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
              }}
              aria-label="Type your message"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              aria-label="Send"
              className="bg-blue-700 text-white hover:bg-blue-800"
            >
              <Send size={20} />
            </Button>
          </form>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIChatWidget;

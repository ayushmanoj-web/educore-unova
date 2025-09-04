import { Bot, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";

const AIFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-6 right-6 z-40",
          "w-12 h-12 rounded-full",
          "bg-gradient-to-r from-violet-500 to-indigo-500",
          "text-white shadow-lg",
          "flex items-center justify-center",
          "hover:scale-105 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2",
          isOpen && "hidden"
        )}
        aria-label="Open AI Chat"
      >
        <Bot size={20} />
      </button>

      {/* Full Screen AI Chat Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className={cn(
              "absolute top-6 right-6 z-[10000]",
              "w-12 h-12 rounded-full",
              "bg-white/10 hover:bg-white/20",
              "text-white",
              "flex items-center justify-center",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-white/40"
            )}
            aria-label="Close AI Chat"
          >
            <X size={20} />
          </button>
          
          {/* AI Chat Component */}
          <div className="w-full h-full">
            <AnimatedAIChat />
          </div>
        </div>
      )}
    </>
  );
};

export default AIFloatingButton;

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import TeachersChat from "@/components/TeachersChat";

const FloatingChatButton = () => {
  // Open state is managed internally by Sheet
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="fixed z-50 bottom-20 right-6 md:bottom-6 md:right-8 bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 focus:outline-none hover:bg-blue-800 transition active:scale-95"
          aria-label="Open group chat"
        >
          <MessageCircle size={22} />
          <span className="font-bold text-base hidden sm:inline">Chat</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[95vh] p-1 sm:max-w-md sm:mx-auto overflow-hidden rounded-t-xl">
        <SheetHeader>
          <SheetTitle className="sr-only">Class Group Chat</SheetTitle>
        </SheetHeader>
        <div className="h-[420px] max-h-[70vh] mt-2">
          <TeachersChat />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FloatingChatButton;

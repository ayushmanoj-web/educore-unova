
import { MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import TeachersChat from "@/components/TeachersChat";

// Custom full-screen class for SheetContent
const fullScreenClass =
  "fixed inset-0 z-50 w-full h-full max-w-full max-h-full top-0 left-0 rounded-none p-0 bg-white animate-fade-in flex flex-col";

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
      <SheetContent
        side="bottom"
        className={fullScreenClass}
      >
        <SheetHeader>
          <SheetTitle className="sr-only">Class Group Chat</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col justify-center">
            <TeachersChat />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FloatingChatButton;

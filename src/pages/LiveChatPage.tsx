
import { ChatTemplate } from "@/components/ui/chat-template";
import { SidebarProvider } from "@/components/ui/sidebar";

const LiveChatPage = () => {
  return (
    <SidebarProvider>
      <ChatTemplate />
    </SidebarProvider>
  );
};

export default LiveChatPage;

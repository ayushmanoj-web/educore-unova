
import LiveChat from "@/components/LiveChat";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LiveChatPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Live Chat</h1>
          <p className="text-slate-600">Connect with everyone in real-time</p>
          <div className="flex gap-4 justify-center mt-4">
            <Button
              onClick={() => navigate("/chats")}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Style Chat
            </Button>
          </div>
        </div>
        <LiveChat />
      </div>
    </div>
  );
};

export default LiveChatPage;

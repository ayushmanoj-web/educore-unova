
import LiveChat from "@/components/LiveChat";

const LiveChatPage = () => {
  return (
    <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Live Chat</h1>
          <p className="text-slate-600">Connect with everyone in real-time</p>
        </div>
        <LiveChat />
      </div>
    </div>
  );
};

export default LiveChatPage;

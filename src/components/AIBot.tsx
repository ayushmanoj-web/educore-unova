
import React, { useState, useEffect } from "react";
import { Bot, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AIBot: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    // Load Jotform embed handler script
    const script = document.createElement('script');
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize Jotform embed handler once script is loaded
      if (window.jotformEmbedHandler) {
        window.jotformEmbedHandler("iframe[id='JotFormIFrame-01977e78685872f9bf17c1032105b079c07e']", "https://www.jotform.com");
      }
    };

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
             onClick={() => setIsMinimized(false)}>
          <Bot className="h-8 w-8 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-96 h-[600px] shadow-2xl flex flex-col rounded-3xl overflow-hidden border-2 border-gradient-to-br from-blue-500 to-purple-600">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-3xl">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            EduBot: Virtual Tutor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 bg-white overflow-hidden">
          <iframe 
            id="JotFormIFrame-01977e78685872f9bf17c1032105b079c07e" 
            title="EduBot: Virtual Tutor"
            allowTransparency={true}
            allow="geolocation; microphone; camera; fullscreen"
            src="https://agent.jotform.com/01977e78685872f9bf17c1032105b079c07e/voice?embedMode=iframe&background=1&shadow=1"
            style={{
              minWidth: '100%',
              maxWidth: '100%',
              height: '100%',
              border: 'none',
              width: '100%'
            }}
            scrolling="no"
            className="flex-1"
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Add type declaration for the Jotform embed handler
declare global {
  interface Window {
    jotformEmbedHandler: (selector: string, url: string) => void;
  }
}

export default AIBot;

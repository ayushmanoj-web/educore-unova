
import React, { useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface VoiceRecorderButtonProps {
  onSend: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const VoiceRecorderButton: React.FC<VoiceRecorderButtonProps> = ({ onSend, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstart = () => {
        setIsRecording(true);
        setIsLoading(false);
      };
      mediaRecorder.onstop = () => {
        setIsRecording(false);
        setIsLoading(false);
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) onSend(blob);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (err) {
      setIsLoading(false);
      alert("Microphone permission denied.");
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={`ml-1 ${isRecording ? "bg-red-500 text-white" : ""}`}
      aria-label={isRecording ? "Stop recording" : "Start voice message"}
      onClick={isRecording ? handleStopRecording : handleStartRecording}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : isRecording ? (
        <MicOff />
      ) : (
        <Mic />
      )}
    </Button>
  );
};

export default VoiceRecorderButton;

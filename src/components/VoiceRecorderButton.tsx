
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Unified event handling for both mouse and touch devices
  const startRecording = async () => {
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Press and hold implementations
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent focus/keyboard triggering voice recording
    if (disabled || isLoading || isRecording) return;
    startRecording();
    // Prevent scrolling on mobile during press
    if ("touches" in e && e.touches.length === 1) {
      e.preventDefault();
    }
  };
  const handlePointerUp = () => {
    if (isRecording) stopRecording();
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className={`ml-1 select-none ${isRecording ? "bg-red-500 text-white" : ""}`}
      aria-label={isRecording ? "Release to send recording" : "Hold to record"}
      disabled={disabled || isLoading}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchEnd={handlePointerUp}
      tabIndex={0}
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

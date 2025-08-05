import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users } from "lucide-react";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

interface Participant {
  id: string;
  name: string;
  image?: string;
  stream?: MediaStream;
}

const VideoCall = ({ isOpen, onClose, currentUser }: VideoCallProps) => {
  const { toast } = useToast();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      startCall();
    } else {
      endCall();
    }

    return () => {
      endCall();
    };
  }, [isOpen]);

  const startCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Set up Supabase realtime channel for signaling
      const channel = supabase.channel('video_call', {
        config: {
          presence: {
            key: currentUser?.phone || 'anonymous'
          }
        }
      });

      channelRef.current = channel;

      // Track presence
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUser?.phone || 'anonymous',
            name: currentUser?.name || 'Anonymous',
            image: currentUser?.image,
            in_call: true,
            timestamp: new Date().toISOString()
          });
          setIsCallActive(true);
        }
      });

      // Handle presence changes
      channel.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const newParticipants: Participant[] = [];
        
        Object.values(presenceState).forEach((presence: any) => {
          presence.forEach((user: any) => {
            if (user.user_id !== currentUser?.phone) {
              newParticipants.push({
                id: user.user_id,
                name: user.name,
                image: user.image
              });
            }
          });
        });
        
        setParticipants(newParticipants);
      });

      // Handle WebRTC signaling
      channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.to === currentUser?.phone) {
          await handleOffer(payload.offer, payload.from);
        }
      });

      channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.to === currentUser?.phone) {
          await handleAnswer(payload.answer, payload.from);
        }
      });

      channel.on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.to === currentUser?.phone) {
          await handleIceCandidate(payload.candidate, payload.from);
        }
      });

      // Initiate calls to existing participants
      setTimeout(async () => {
        const presenceState = channel.presenceState();
        Object.values(presenceState).forEach((presence: any) => {
          presence.forEach(async (user: any) => {
            if (user.user_id !== currentUser?.phone) {
              await createPeerConnection(user.user_id, true);
            }
          });
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start video call. Please check your camera and microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const createPeerConnection = async (participantId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    peerConnections.current.set(participantId, pc);

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, stream: remoteStream }
            : p
        )
      );
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            candidate: event.candidate,
            to: participantId,
            from: currentUser?.phone
          }
        });
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'offer',
          payload: {
            offer,
            to: participantId,
            from: currentUser?.phone
          }
        });
      }
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, from: string) => {
    await createPeerConnection(from, false);
    const pc = peerConnections.current.get(from);
    if (!pc) return;
    
    await pc.setRemoteDescription(offer);
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          answer,
          to: from,
          from: currentUser?.phone
        }
      });
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, from: string) => {
    const pc = peerConnections.current.get(from);
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidate, from: string) => {
    const pc = peerConnections.current.get(from);
    if (pc) {
      await pc.addIceCandidate(candidate);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();

    // Leave channel
    if (channelRef.current) {
      channelRef.current.untrack();
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    setParticipants([]);
    setIsCallActive(false);
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl h-[80vh] bg-gray-900 border-gray-700">
        <CardContent className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Video Call</span>
              <span className="text-sm text-gray-300">
                ({participants.length + 1} participants)
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={endCall}
              className="flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </Button>
          </div>

          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Local video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                You {!isVideoEnabled && "(Video Off)"}
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <Avatar className="w-16 h-16">
                    {currentUser?.image ? (
                      <AvatarImage src={currentUser.image} alt={currentUser.name} />
                    ) : (
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {getInitials(currentUser?.name || "You")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              )}
            </div>

            {/* Remote videos */}
            {participants.map((participant) => (
              <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                {participant.stream ? (
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(video) => {
                      if (video && participant.stream) {
                        video.srcObject = participant.stream;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <Avatar className="w-16 h-16">
                      {participant.image ? (
                        <AvatarImage src={participant.image} alt={participant.name} />
                      ) : (
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                          {getInitials(participant.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                  {participant.name}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-12 h-12 p-0"
            >
              {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={isVideoEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-12 h-12 p-0"
            >
              {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoCall;
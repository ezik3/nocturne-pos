import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Radio, Video, VideoOff, Mic, MicOff, RotateCcw, Camera, Square, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GoLiveRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  userAvatar?: string;
  userName?: string;
  onComplete: (data: {
    videoUrl: string;
    content: string;
    visibility: "private" | "public";
    isLive: boolean;
  }) => void;
}

export default function GoLiveRecorder({
  isOpen,
  onClose,
  userAvatar,
  userName,
  onComplete,
}: GoLiveRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [recordingTime, setRecordingTime] = useState(0);
  const [visibility, setVisibility] = useState<"private" | "public">("public");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      resetState();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const resetState = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setRecordedBlob(null);
    setPreviewUrl(null);
    setDescription("");
    chunksRef.current = [];
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Could not access camera. Please grant permission.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const switchCamera = async () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const options = { mimeType: "video/webm;codecs=vp9,opus" };
    
    try {
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
    } catch {
      // Fallback for Safari
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
    }

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    };

    mediaRecorderRef.current.start(1000);
    setIsRecording(true);
    toast.success("🔴 You are now LIVE!");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped! Review your video.");
    }
  };

  const handleUploadAndPost = async () => {
    if (!recordedBlob) {
      toast.error("No video recorded!");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to post");
        setIsUploading(false);
        return;
      }

      // Upload to Supabase storage
      const fileName = `${user.id}/${Date.now()}-live.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("live-videos")
        .upload(fileName, recordedBlob, {
          contentType: "video/webm",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("live-videos")
        .getPublicUrl(uploadData.path);

      const videoUrl = urlData.publicUrl;

      // Call parent with video data
      onComplete({
        videoUrl,
        content: description,
        visibility,
        isLive: true,
      });

      toast.success("Live video posted successfully!");
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
      >
        {/* Video Preview */}
        <div className="relative w-full h-full">
          {!previewUrl ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />
          ) : (
            <video
              src={previewUrl}
              controls
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* Camera off overlay */}
          {!isCameraOn && !previewUrl && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/50">Camera is off</p>
              </div>
            </div>
          )}

          {/* Top Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-red-500">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-pink text-white">
                    {userName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">{userName || "You"}</p>
                  {/* Visibility Toggle */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setVisibility("public")}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all ${
                        visibility === "public"
                          ? "bg-neon-cyan text-black"
                          : "bg-white/20 text-white/70"
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      Public
                    </button>
                    <button
                      onClick={() => setVisibility("private")}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all ${
                        visibility === "private"
                          ? "bg-neon-purple text-white"
                          : "bg-white/20 text-white/70"
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      Private
                    </button>
                  </div>
                </div>
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <div className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full">
                  <Radio className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-white font-bold text-sm">LIVE</span>
                  <span className="text-white/80 text-sm">{formatTime(recordingTime)}</span>
                </div>
              )}

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white"
                onClick={onClose}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Description Input (shown after recording) */}
          {previewUrl && (
            <div className="absolute bottom-32 left-4 right-4">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description to your live video..."
                className="bg-black/60 border-white/20 text-white placeholder:text-white/50 resize-none"
                rows={2}
                maxLength={280}
              />
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            {!previewUrl ? (
              /* Recording Controls */
              <div className="flex items-center justify-center gap-6">
                {/* Toggle Mic */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20"
                  onClick={toggleMic}
                >
                  {isMicOn ? (
                    <Mic className="w-6 h-6 text-white" />
                  ) : (
                    <MicOff className="w-6 h-6 text-red-500" />
                  )}
                </Button>

                {/* Record/Stop Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 text-white fill-white" />
                  ) : (
                    <Radio className="w-10 h-10 text-white" />
                  )}
                </button>

                {/* Toggle Camera */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20"
                  onClick={toggleCamera}
                >
                  {isCameraOn ? (
                    <Video className="w-6 h-6 text-white" />
                  ) : (
                    <VideoOff className="w-6 h-6 text-red-500" />
                  )}
                </Button>
              </div>
            ) : (
              /* Post-Recording Controls */
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => {
                    setRecordedBlob(null);
                    setPreviewUrl(null);
                    setRecordingTime(0);
                    startCamera();
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Record Again
                </Button>
                <Button
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 text-white px-8"
                  onClick={handleUploadAndPost}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Radio className="w-4 h-4 mr-2" />
                      Post Live Video
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Switch Camera Button */}
            {!previewUrl && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white"
                  onClick={switchCamera}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Flip Camera
                </Button>
              </div>
            )}

            {/* Instructions */}
            {!isRecording && !previewUrl && (
              <p className="text-center text-white/60 text-sm mt-4">
                Tap the red button to start your live video
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

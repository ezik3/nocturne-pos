import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, Shield, CheckCircle2, Camera, Sparkles, Eye, Lock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight as ArrowRightIcon, RotateCcw } from "lucide-react";

type Direction = "up" | "down" | "left" | "right" | "center";
type Phase = "intro" | "scanning" | "processing" | "complete";

const directionInstructions: Record<Direction, { text: string; icon: React.ReactNode }> = {
  center: { text: "Look straight at the camera", icon: <div className="w-4 h-4 rounded-full bg-cyan" /> },
  up: { text: "Slowly look up", icon: <ArrowUp className="w-6 h-6 text-cyan" /> },
  down: { text: "Slowly look down", icon: <ArrowDown className="w-6 h-6 text-cyan" /> },
  left: { text: "Turn your head left", icon: <ArrowLeft className="w-6 h-6 text-cyan" /> },
  right: { text: "Turn your head right", icon: <ArrowRightIcon className="w-6 h-6 text-cyan" /> },
};

const UserFacialRecognition = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [scanProgress, setScanProgress] = useState(0);
  const [currentDirection, setCurrentDirection] = useState<Direction>("center");
  const [completedDirections, setCompletedDirections] = useState<Direction[]>([]);
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0 });

  const directions: Direction[] = ["center", "up", "right", "down", "left"];

  // Simulate face movement detection
  useEffect(() => {
    if (phase === "scanning") {
      // Change direction every 2 seconds
      const directionInterval = setInterval(() => {
        setCompletedDirections((prev) => {
          const newCompleted = [...prev, currentDirection];
          const nextIndex = newCompleted.length;
          
          if (nextIndex >= directions.length) {
            clearInterval(directionInterval);
            setPhase("processing");
            return prev;
          }
          
          setCurrentDirection(directions[nextIndex]);
          return newCompleted;
        });
      }, 2000);

      // Simulate face position tracking
      const positionInterval = setInterval(() => {
        setFacePosition({
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 20,
        });
      }, 100);

      // Update progress
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 1;
        });
      }, 100);

      return () => {
        clearInterval(directionInterval);
        clearInterval(positionInterval);
        clearInterval(progressInterval);
      };
    }
  }, [phase, currentDirection]);

  useEffect(() => {
    if (phase === "processing") {
      const timeout = setTimeout(() => {
        setPhase("complete");
      }, 2000);
      return () => clearTimeout(timeout);
    }

    if (phase === "complete") {
      const timeout = setTimeout(() => {
        navigate("/user/private-key");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [phase, navigate]);

  const startScan = () => {
    setPhase("scanning");
    setScanProgress(0);
    setCurrentDirection("center");
    setCompletedDirections([]);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink/10 rounded-full blur-3xl animate-float" />
        
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--cyan) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--cyan) / 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/10 border border-cyan/30 mb-4">
            <Sparkles className="w-4 h-4 text-cyan" />
            <span className="text-sm font-medium text-cyan">Biometric Security</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            <span className="text-gradient-primary">Facial Recognition</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {phase === "scanning" 
              ? "Follow the instructions to verify your identity"
              : "Secure your identity with advanced AI-powered facial recognition"
            }
          </p>
        </div>

        {/* Direction instruction banner */}
        {phase === "scanning" && (
          <div className="mb-6 px-6 py-3 rounded-full bg-cyan/10 border border-cyan/30 flex items-center gap-3 animate-pulse">
            <RotateCcw className="w-5 h-5 text-cyan animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-cyan font-medium">{directionInstructions[currentDirection].text}</span>
            {directionInstructions[currentDirection].icon}
          </div>
        )}

        {/* Main scanner area */}
        <div className="relative w-80 h-80 md:w-96 md:h-96">
          {/* Outer rotating ring */}
          <div 
            className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan/30 ${phase === "scanning" ? "animate-spin-slow" : ""}`}
          />
          
          {/* Direction indicators */}
          {phase === "scanning" && (
            <>
              <div className={`absolute -top-8 left-1/2 -translate-x-1/2 transition-all duration-300 ${currentDirection === "up" ? "opacity-100 scale-125" : "opacity-30"}`}>
                <ArrowUp className="w-8 h-8 text-cyan" />
              </div>
              <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transition-all duration-300 ${currentDirection === "down" ? "opacity-100 scale-125" : "opacity-30"}`}>
                <ArrowDown className="w-8 h-8 text-cyan" />
              </div>
              <div className={`absolute top-1/2 -left-8 -translate-y-1/2 transition-all duration-300 ${currentDirection === "left" ? "opacity-100 scale-125" : "opacity-30"}`}>
                <ArrowLeft className="w-8 h-8 text-cyan" />
              </div>
              <div className={`absolute top-1/2 -right-8 -translate-y-1/2 transition-all duration-300 ${currentDirection === "right" ? "opacity-100 scale-125" : "opacity-30"}`}>
                <ArrowRightIcon className="w-8 h-8 text-cyan" />
              </div>
            </>
          )}
          
          {/* Pulsing rings */}
          {phase === "scanning" && (
            <>
              <div className="absolute inset-4 rounded-full border border-cyan/40 animate-pulse-ring" />
              <div className="absolute inset-8 rounded-full border border-purple/40 animate-pulse-ring delay-500" />
              <div className="absolute inset-12 rounded-full border border-pink/40 animate-pulse-ring delay-1000" />
            </>
          )}

          {/* Main face area */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-card via-card to-secondary/50 border border-border overflow-hidden shadow-2xl">
            {/* Scanning line */}
            {phase === "scanning" && (
              <div 
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan to-transparent animate-scan-line shadow-lg"
                style={{ 
                  boxShadow: "0 0 20px hsl(var(--cyan)), 0 0 40px hsl(var(--cyan) / 0.5)",
                  top: `${scanProgress}%`
                }}
              />
            )}

            {/* Face placeholder with movement tracking */}
            <div className="absolute inset-0 flex items-center justify-center">
              {phase === "intro" && (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan/20 to-purple/20 border-2 border-dashed border-cyan/50 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-cyan" />
                  </div>
                  <p className="text-sm text-muted-foreground px-6">Position your face within the frame</p>
                </div>
              )}

              {phase === "scanning" && (
                <div 
                  className="relative transition-transform duration-100"
                  style={{ transform: `translate(${facePosition.x}px, ${facePosition.y}px)` }}
                >
                  {/* Face mesh visualization */}
                  <div className="w-32 h-40 relative">
                    {/* Face outline */}
                    <div className="absolute inset-0 border-2 border-cyan/60 rounded-[50%] animate-pulse" />
                    
                    {/* Eye tracking points */}
                    <div className="absolute top-1/3 left-1/4 flex gap-6">
                      <div className="relative">
                        <Eye className="w-6 h-6 text-purple animate-pulse" />
                        <div className="absolute -inset-1 bg-purple/30 rounded-full blur animate-ping" />
                      </div>
                      <div className="relative">
                        <Eye className="w-6 h-6 text-purple animate-pulse delay-150" />
                        <div className="absolute -inset-1 bg-purple/30 rounded-full blur animate-ping delay-150" />
                      </div>
                    </div>
                    
                    {/* Face detection grid */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-5 gap-1 p-2">
                      {[...Array(20)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-2 h-2 rounded-full bg-cyan/60 animate-pulse"
                          style={{ animationDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {phase === "processing" && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center animate-pulse">
                    <Shield className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-foreground font-medium">Processing biometrics...</p>
                </div>
              )}

              {phase === "complete" && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green flex items-center justify-center neon-glow-cyan">
                    <CheckCircle2 className="w-10 h-10 text-background" />
                  </div>
                  <p className="text-sm text-green font-bold">Verified Successfully!</p>
                </div>
              )}
            </div>

            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan/70" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan/70" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan/70" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan/70" />
          </div>

          {/* Outer glow ring */}
          <div 
            className={`absolute -inset-2 rounded-full ${phase === "scanning" ? "animate-glow-pulse" : ""}`}
            style={{
              background: phase === "scanning" 
                ? "radial-gradient(circle, transparent 50%, hsl(var(--cyan) / 0.1) 100%)" 
                : "transparent"
            }}
          />
        </div>

        {/* Progress section */}
        {phase === "scanning" && (
          <div className="w-80 md:w-96 mt-8 space-y-4">
            {/* Direction progress */}
            <div className="flex justify-center gap-2">
              {directions.map((dir, i) => (
                <div 
                  key={dir}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    completedDirections.includes(dir) 
                      ? "bg-cyan border-cyan" 
                      : currentDirection === dir 
                        ? "border-cyan animate-pulse" 
                        : "border-border"
                  }`}
                >
                  {completedDirections.includes(dir) ? (
                    <CheckCircle2 className="w-5 h-5 text-background" />
                  ) : (
                    <span className="text-xs text-muted-foreground">{i + 1}</span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Overall progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Scanning...</span>
                <span className="text-cyan font-mono">{Math.min(scanProgress, 100)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-primary rounded-full transition-all duration-100"
                  style={{ width: `${Math.min(scanProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-10 space-y-4 w-full max-w-sm">
          {phase === "intro" && (
            <>
              <Button
                onClick={startScan}
                className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple/25"
              >
                <Scan className="w-5 h-5 mr-2" />
                Begin Face Scan
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate("/user/private-key")}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Skip for now (Dev Mode)
              </Button>
            </>
          )}
        </div>

        {/* Security badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <Lock className="w-4 h-4 text-cyan" />
            <span className="text-xs text-muted-foreground">256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <Shield className="w-4 h-4 text-purple" />
            <span className="text-xs text-muted-foreground">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <Sparkles className="w-4 h-4 text-pink" />
            <span className="text-xs text-muted-foreground">AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFacialRecognition;
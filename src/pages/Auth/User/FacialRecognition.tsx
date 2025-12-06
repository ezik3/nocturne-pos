import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, Shield, CheckCircle2, Camera, Sparkles, Eye, Lock } from "lucide-react";

const UserFacialRecognition = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"intro" | "scanning" | "processing" | "complete">("intro");
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (phase === "scanning") {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase("processing");
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }

    if (phase === "processing") {
      const timeout = setTimeout(() => {
        setPhase("complete");
      }, 2000);
      return () => clearTimeout(timeout);
    }

    if (phase === "complete") {
      const timeout = setTimeout(() => {
        navigate("/app/feed");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [phase, navigate]);

  const startScan = () => {
    setPhase("scanning");
    setScanProgress(0);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink/10 rounded-full blur-3xl animate-float" />
        
        {/* Grid overlay */}
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
            Secure your identity with advanced AI-powered facial recognition technology
          </p>
        </div>

        {/* Main scanner area */}
        <div className="relative w-80 h-80 md:w-96 md:h-96">
          {/* Outer rotating ring */}
          <div 
            className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan/30 ${phase === "scanning" ? "animate-spin-slow" : ""}`}
          />
          
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

            {/* Face placeholder with grid */}
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
                <div className="relative">
                  {/* Face detection points */}
                  <div className="grid grid-cols-3 gap-4 opacity-80">
                    {[...Array(9)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-3 h-3 rounded-full bg-cyan animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  {/* Eye trackers */}
                  <div className="absolute top-1/3 left-1/4 flex gap-8">
                    <Eye className="w-6 h-6 text-purple animate-pulse" />
                    <Eye className="w-6 h-6 text-purple animate-pulse delay-150" />
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

        {/* Progress bar */}
        {phase === "scanning" && (
          <div className="w-80 md:w-96 mt-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Scanning...</span>
              <span className="text-cyan font-mono">{scanProgress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-100"
                style={{ width: `${scanProgress}%` }}
              />
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
                Begin Scan
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate("/app/feed")}
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

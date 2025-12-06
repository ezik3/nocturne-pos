import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scan, Shield, CheckCircle2, Camera, Sparkles, Eye, Lock, Building2, Fingerprint } from "lucide-react";

const VenueFacialRecognition = () => {
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
        navigate("/venue/private-key");
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
      {/* Animated background effects - Venue uses warm gradient */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange/10 rounded-full blur-3xl animate-float" />
        
        {/* Hexagonal grid overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(hsl(var(--purple) / 0.3) 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple/10 border border-purple/30 mb-4">
            <Building2 className="w-4 h-4 text-purple" />
            <span className="text-sm font-medium text-purple">Venue Verification</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            <span className="text-gradient-warm">Owner Verification</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Verify your identity as the venue owner with our enterprise-grade biometric system
          </p>
        </div>

        {/* Main scanner area */}
        <div className="relative w-80 h-80 md:w-96 md:h-96">
          {/* Outer hexagonal frame effect */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <polygon 
              points="50,2 95,25 95,75 50,98 5,75 5,25" 
              fill="none" 
              stroke="url(#gradient1)" 
              strokeWidth="0.5"
              className={phase === "scanning" ? "animate-pulse" : ""}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--purple))" />
                <stop offset="100%" stopColor="hsl(var(--gold))" />
              </linearGradient>
            </defs>
          </svg>

          {/* Pulsing rings */}
          {phase === "scanning" && (
            <>
              <div className="absolute inset-4 rounded-full border border-purple/40 animate-pulse-ring" />
              <div className="absolute inset-8 rounded-full border border-orange/40 animate-pulse-ring delay-500" />
              <div className="absolute inset-12 rounded-full border border-gold/40 animate-pulse-ring delay-1000" />
            </>
          )}

          {/* Main face area */}
          <div className="absolute inset-12 rounded-full bg-gradient-to-br from-card via-card to-secondary/50 border border-border overflow-hidden shadow-2xl">
            {/* Dual scanning lines */}
            {phase === "scanning" && (
              <>
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple to-transparent"
                  style={{ 
                    boxShadow: "0 0 15px hsl(var(--purple)), 0 0 30px hsl(var(--purple) / 0.5)",
                    top: `${scanProgress}%`
                  }}
                />
                <div 
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent"
                  style={{ 
                    boxShadow: "0 0 15px hsl(var(--gold)), 0 0 30px hsl(var(--gold) / 0.5)",
                    top: `${100 - scanProgress}%`
                  }}
                />
              </>
            )}

            {/* Face placeholder with grid */}
            <div className="absolute inset-0 flex items-center justify-center">
              {phase === "intro" && (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple/20 to-gold/20 border-2 border-dashed border-purple/50 flex items-center justify-center">
                    <Fingerprint className="w-10 h-10 text-purple" />
                  </div>
                  <p className="text-sm text-muted-foreground px-6">Position your face within the frame</p>
                </div>
              )}

              {phase === "scanning" && (
                <div className="relative">
                  {/* Biometric grid points */}
                  <div className="grid grid-cols-4 gap-3 opacity-80">
                    {[...Array(16)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-purple' : 'bg-gold'} animate-pulse`}
                        style={{ animationDelay: `${i * 80}ms` }}
                      />
                    ))}
                  </div>
                  {/* Eye trackers */}
                  <div className="absolute top-1/4 left-1/4 flex gap-6">
                    <Eye className="w-5 h-5 text-orange animate-pulse" />
                    <Eye className="w-5 h-5 text-orange animate-pulse delay-150" />
                  </div>
                </div>
              )}

              {phase === "processing" && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-warm flex items-center justify-center animate-pulse">
                    <Shield className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-foreground font-medium">Verifying ownership...</p>
                </div>
              )}

              {phase === "complete" && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green flex items-center justify-center neon-glow">
                    <CheckCircle2 className="w-10 h-10 text-background" />
                  </div>
                  <p className="text-sm text-green font-bold">Identity Confirmed!</p>
                </div>
              )}
            </div>

            {/* Diamond corner brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-purple/70 rotate-45" />
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-gold/70 rotate-45" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-gold/70 rotate-45" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-purple/70 rotate-45" />
          </div>

          {/* Outer decorative elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-gold rounded-full animate-pulse delay-500" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange rounded-full animate-pulse delay-1000" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-pink rounded-full animate-pulse delay-700" />
        </div>

        {/* Progress bar */}
        {phase === "scanning" && (
          <div className="w-80 md:w-96 mt-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Biometric Analysis...</span>
              <span className="text-purple font-mono">{scanProgress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full gradient-warm rounded-full transition-all duration-100"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-2 text-muted-foreground">
              <span>Facial mapping</span>
              <span>Identity verification</span>
              <span>Security check</span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-10 space-y-4 w-full max-w-sm">
          {phase === "intro" && (
            <>
              <Button
                onClick={startScan}
                className="w-full h-14 text-lg font-semibold gradient-warm hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange/25"
              >
                <Scan className="w-5 h-5 mr-2" />
                Verify Identity
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => navigate("/venue/private-key")}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Skip for now (Dev Mode)
              </Button>
            </>
          )}
        </div>

        {/* Enterprise security badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <Lock className="w-4 h-4 text-purple" />
            <span className="text-xs text-muted-foreground">Bank-Grade Security</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <Shield className="w-4 h-4 text-gold" />
            <span className="text-xs text-muted-foreground">PCI DSS Compliant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border">
            <Sparkles className="w-4 h-4 text-orange" />
            <span className="text-xs text-muted-foreground">Enterprise AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueFacialRecognition;

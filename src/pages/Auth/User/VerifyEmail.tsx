import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function UserVerifyEmail() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  
  const userEmail = localStorage.getItem('jv_signup_email') || 'your email';

  // Auto-advance placeholder - remove when Twilio is integrated
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Replace with actual verification API call
    // Simulating verification for now
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setVerified(true);
    
    // Navigate to phone verification after brief delay
    setTimeout(() => {
      navigate('/user/verify-phone');
    }, 1500);
  };

  // Skip button for development - remove in production
  const handleSkip = () => {
    navigate('/user/verify-phone');
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative flex items-center justify-center p-4">
      {/* Animated background - Cyan theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,242,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,242,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <div className="w-8 h-0.5 bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-8 h-0.5 bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-8 h-0.5 bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-primary flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  {verified ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <Mail className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500 to-primary rounded-2xl blur opacity-40 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {verified ? 'Email Verified!' : 'Verify Your Email'}
              </h1>
              <p className="text-muted-foreground">
                {verified 
                  ? 'Redirecting to phone verification...'
                  : `Enter the 6-digit code sent to ${userEmail}`
                }
              </p>
            </div>

            {!verified && (
              <form onSubmit={handleVerify} className="space-y-6">
                {/* OTP Input */}
                <div className="flex justify-center">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-muted/50 border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 w-48"
                    disabled={loading}
                  />
                </div>

                {/* Verify Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-primary hover:opacity-90 text-white font-semibold transition-all duration-300 group"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify Email
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>

                {/* Resend */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button type="button" className="text-cyan-500 hover:underline font-medium">
                      Resend Code
                    </button>
                  </p>
                </div>

                {/* Skip button - DEV ONLY */}
                <div className="pt-4 border-t border-border/50">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now (Dev Mode) →
                  </button>
                </div>
              </form>
            )}

            {verified && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-foreground">Joint Vibe</span>
        </div>
      </div>
    </div>
  );
}

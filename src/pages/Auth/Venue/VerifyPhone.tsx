import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Phone, ArrowRight, CheckCircle, Building2 } from 'lucide-react';

export default function VenueVerifyPhone() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Replace with actual Twilio verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setVerified(true);
    
    setTimeout(() => {
      navigate('/venue/id-verification');
    }, 1500);
  };

  const handleSkip = () => {
    navigate('/venue/id-verification');
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Progress indicator - 9 steps for venue */}
        <div className="flex items-center justify-center gap-1 mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <div className="w-6 h-0.5 bg-primary" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <div className="w-6 h-0.5 bg-primary" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <div className="w-6 h-0.5 bg-primary" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <div className="w-6 h-0.5 bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-6 h-0.5 bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>

        <p className="text-center text-sm text-muted-foreground mb-4">Step 4 of 9</p>

        {/* Card */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Venue badge */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Venue Registration</span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                  {verified ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <Phone className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-2xl blur opacity-40 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {verified ? 'Phone Verified!' : 'Verify Business Phone'}
              </h1>
              <p className="text-muted-foreground">
                {verified 
                  ? 'Redirecting to identity verification...'
                  : 'Enter the 6-digit code sent to your phone'
                }
              </p>
            </div>

            {!verified && (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-muted/50 border-primary/30 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary w-48"
                    disabled={loading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold transition-all duration-300 group"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify Phone
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button type="button" className="text-primary hover:underline font-medium">
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
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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

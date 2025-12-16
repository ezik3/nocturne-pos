import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building2, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function VenuePendingApproval() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [venueName, setVenueName] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const storedVenueName = localStorage.getItem('jv_venue_name');
    if (storedVenueName) setVenueName(storedVenueName);
    checkApprovalStatus();
  }, []);

  const checkApprovalStatus = async () => {
    setIsChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: venue, error } = await supabase
        .from('venues')
        .select('approval_status, rejection_reason')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking approval status:', error);
        return;
      }

      if (venue) {
        setStatus(venue.approval_status as 'pending' | 'approved' | 'rejected');
        setRejectionReason(venue.rejection_reason);

        if (venue.approval_status === 'approved') {
          setTimeout(() => {
            navigate('/venue/home');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-warning/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-warning/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Venue badge */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 rounded-full border border-warning/20">
                <Building2 className="w-3.5 h-3.5 text-warning" />
                <span className="text-xs font-medium text-warning">Registration Status</span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                  status === 'pending' 
                    ? 'bg-gradient-to-br from-warning to-orange shadow-warning/30' 
                    : status === 'approved'
                    ? 'bg-gradient-to-br from-success to-primary shadow-success/30'
                    : 'bg-gradient-to-br from-destructive to-orange shadow-destructive/30'
                }`}>
                  {status === 'pending' && <Clock className="w-10 h-10 text-white" />}
                  {status === 'approved' && <CheckCircle className="w-10 h-10 text-white" />}
                  {status === 'rejected' && <XCircle className="w-10 h-10 text-white" />}
                </div>
                <div className={`absolute -inset-1 rounded-2xl blur opacity-40 animate-pulse ${
                  status === 'pending' ? 'bg-warning' : status === 'approved' ? 'bg-success' : 'bg-destructive'
                }`} />
              </div>
            </div>

            {/* Title & Message */}
            <div className="text-center mb-6">
              {status === 'pending' && (
                <>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    Registration Under Review
                  </h1>
                  <p className="text-muted-foreground">
                    Thank you for registering <span className="text-warning font-semibold">{venueName || 'your venue'}</span>! 
                    Our team is reviewing your application.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    This usually takes 1-2 business days. You'll receive an email once your venue is approved.
                  </p>
                </>
              )}
              
              {status === 'approved' && (
                <>
                  <h1 className="text-2xl lg:text-3xl font-bold text-success mb-2">
                    Venue Approved!
                  </h1>
                  <p className="text-muted-foreground">
                    Congratulations! Your venue has been approved. Redirecting to your dashboard...
                  </p>
                </>
              )}
              
              {status === 'rejected' && (
                <>
                  <h1 className="text-2xl lg:text-3xl font-bold text-destructive mb-2">
                    Registration Declined
                  </h1>
                  <p className="text-muted-foreground">
                    Unfortunately, your venue registration was not approved.
                  </p>
                  {rejectionReason && (
                    <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive font-medium">Reason:</p>
                      <p className="text-sm text-muted-foreground mt-1">{rejectionReason}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {status === 'pending' && (
                <Button 
                  onClick={checkApprovalStatus}
                  disabled={isChecking}
                  className="w-full h-12 rounded-xl bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30"
                  variant="outline"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Checking...' : 'Check Status'}
                </Button>
              )}

              <Button 
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Sign Out & Return Later
              </Button>
            </div>

            {/* Info boxes for pending */}
            {status === 'pending' && (
              <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Document Review</p>
                    <p className="text-xs text-muted-foreground">We're verifying your business documents</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Business Verification</p>
                    <p className="text-xs text-muted-foreground">Confirming license and location details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Approval</p>
                    <p className="text-xs text-muted-foreground">Final review and activation</p>
                  </div>
                </div>
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

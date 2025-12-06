import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  Building2, 
  Upload, 
  CheckCircle, 
  ArrowRight,
  Lock,
  ImageIcon,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function VenueProfileSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Get data from previous steps
  const [ownerName, setOwnerName] = useState('');
  const [venueName, setVenueName] = useState('');

  useEffect(() => {
    const storedOwnerName = localStorage.getItem('jv_verified_name');
    const storedVenueName = localStorage.getItem('jv_venue_name');
    if (storedOwnerName) setOwnerName(storedOwnerName);
    if (storedVenueName) setVenueName(storedVenueName);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Logo must be less than 10MB');
        return;
      }
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        setIsUploading(false);
        toast.success('Venue logo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    if (!logo) {
      toast.error('Please upload your venue logo');
      return;
    }

    setIsComplete(true);
    localStorage.setItem('jv_venue_logo', logo);
    localStorage.setItem('jv_venue_profile_setup', 'complete');

    setTimeout(() => {
      navigate('/venue/home');
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-gold/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange/5 rounded-full blur-3xl animate-float" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${i <= 8 ? 'bg-primary' : 'bg-border'}`} />
              {i < 8 && <div className={`w-4 h-0.5 ${i < 8 ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-4">Final Step - Venue Profile</p>

        {/* Card */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Venue badge */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Venue Setup</span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple via-gold to-orange flex items-center justify-center shadow-lg shadow-purple/30">
                  {isComplete ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <Building2 className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple via-gold to-orange rounded-2xl blur opacity-40 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {isComplete ? 'Venue Ready!' : 'Complete Venue Profile'}
              </h1>
              <p className="text-muted-foreground">
                {isComplete 
                  ? 'Redirecting to your dashboard...'
                  : 'Upload your venue logo to complete setup'
                }
              </p>
            </div>

            {!isComplete && (
              <div className="space-y-6">
                {/* Logo Upload */}
                <div className="flex flex-col items-center">
                  <div 
                    className="relative w-40 h-40 rounded-2xl border-4 border-dashed border-purple/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple transition-colors group bg-secondary/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logo ? (
                      <img src={logo} alt="Venue Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground group-hover:text-purple transition-colors">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-sm">Upload Logo</span>
                      </div>
                    )}
                    
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Logo dimensions info */}
                  <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border flex items-start gap-2">
                    <Info className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Recommended Dimensions</p>
                      <p>• Square format: 500x500px to 1000x1000px</p>
                      <p>• Max file size: 10MB</p>
                      <p>• Formats: PNG, JPG, SVG (transparent preferred)</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 gap-2 border-purple/50 text-purple hover:bg-purple/10"
                  >
                    <Upload className="w-4 h-4" />
                    {logo ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                </div>

                {/* Venue Name - Read Only */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Venue Name</Label>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <Input
                    value={venueName}
                    readOnly
                    className="bg-secondary/50 border-border cursor-not-allowed"
                  />
                </div>

                {/* Owner Name - Read Only */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Owner Name (from ID)</Label>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <Input
                    value={ownerName}
                    readOnly
                    className="bg-secondary/50 border-border cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Owner identity is verified and cannot be changed
                  </p>
                </div>

                {/* Complete Button */}
                <Button 
                  onClick={handleComplete}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-purple via-gold to-orange hover:opacity-90 text-white font-semibold transition-all duration-300 group"
                  disabled={!logo}
                >
                  <span className="flex items-center gap-2">
                    Launch Venue Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>

                {/* Skip button - DEV ONLY */}
                <div className="pt-4 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => navigate('/venue/home')}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now (Dev Mode) →
                  </button>
                </div>
              </div>
            )}

            {isComplete && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
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
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  User, 
  Camera, 
  Upload, 
  CheckCircle, 
  ArrowRight,
  Lock,
  ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfileSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Get name from ID verification (stored in localStorage)
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('jv_verified_name');
    const storedDob = localStorage.getItem('jv_verified_dob');
    if (storedName) setFullName(storedName);
    if (storedDob) setDateOfBirth(storedDob);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setIsUploading(false);
        toast.success('Profile photo uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In production, you'd show a camera preview and capture
      // For now, simulate taking a photo
      stream.getTracks().forEach(track => track.stop());
      
      // Simulate captured photo
      setProfileImage('/placeholder.svg');
      toast.success('Photo captured!');
    } catch {
      toast.error('Camera access denied. Please upload a photo instead.');
    }
  };

  const handleComplete = () => {
    if (!profileImage) {
      toast.error('Please add a profile photo');
      return;
    }

    setIsComplete(true);
    localStorage.setItem('jv_profile_image', profileImage);
    localStorage.setItem('jv_profile_setup', 'complete');

    setTimeout(() => {
      navigate('/app/feed');
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink/5 rounded-full blur-3xl animate-float" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${i <= 5 ? 'bg-cyan' : 'bg-border'}`} />
              {i < 5 && <div className={`w-6 h-0.5 ${i < 5 ? 'bg-cyan' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-4">Final Step - Profile Setup</p>

        {/* Card */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan via-purple to-pink flex items-center justify-center shadow-lg shadow-cyan/30">
                  {isComplete ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan via-purple to-pink rounded-2xl blur opacity-40 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {isComplete ? 'Profile Created!' : 'Complete Your Profile'}
              </h1>
              <p className="text-muted-foreground">
                {isComplete 
                  ? 'Redirecting to your feed...'
                  : 'Add a profile photo to complete your setup'
                }
              </p>
            </div>

            {!isComplete && (
              <div className="space-y-6">
                {/* Profile Photo Upload */}
                <div className="flex flex-col items-center">
                  <div 
                    className="relative w-32 h-32 rounded-full border-4 border-dashed border-cyan/50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-cyan transition-colors group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground group-hover:text-cyan transition-colors">
                        <ImageIcon className="w-10 h-10 mb-2" />
                        <span className="text-xs">Add Photo</span>
                      </div>
                    )}
                    
                    {isUploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
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

                  <div className="flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2 border-cyan/50 text-cyan hover:bg-cyan/10"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTakePhoto}
                      className="gap-2 border-purple/50 text-purple hover:bg-purple/10"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </Button>
                  </div>
                </div>

                {/* Name from ID - Read Only */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Full Name (from ID)</Label>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <Input
                    value={fullName}
                    readOnly
                    className="bg-secondary/50 border-border cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Name is verified from your ID and cannot be changed
                  </p>
                </div>

                {/* Date of Birth - Read Only */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground">Date of Birth (from ID)</Label>
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <Input
                    value={dateOfBirth}
                    readOnly
                    className="bg-secondary/50 border-border cursor-not-allowed"
                  />
                </div>

                {/* Complete Button */}
                <Button 
                  onClick={handleComplete}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan via-purple to-pink hover:opacity-90 text-white font-semibold transition-all duration-300 group"
                  disabled={!profileImage}
                >
                  <span className="flex items-center gap-2">
                    Complete Profile
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>

                {/* Skip button - DEV ONLY */}
                <div className="pt-4 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => navigate('/app/feed')}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip for now (Dev Mode) →
                  </button>
                </div>
              </div>
            )}

            {isComplete && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
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
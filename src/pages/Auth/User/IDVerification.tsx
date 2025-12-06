import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  Upload, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  Camera,
  FileCheck,
  ShieldCheck,
  Scan
} from 'lucide-react';

export default function UserIDVerification() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [extractedName, setExtractedName] = useState('');
  const [extractedDOB, setExtractedDOB] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [scanningFront, setScanningFront] = useState(false);
  const [scanningBack, setScanningBack] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageUpload = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (side === 'front') {
          setFrontImage(reader.result as string);
          setScanningFront(true);
          // Simulate OCR extraction
          setTimeout(() => {
            setExtractedName('John Smith'); // TODO: Replace with actual OCR
            setExtractedDOB('15/03/1990');
            setScanningFront(false);
          }, 2000);
        } else {
          setBackImage(reader.result as string);
          setScanningBack(true);
          setTimeout(() => {
            setScanningBack(false);
          }, 1500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontImage || !backImage) return;
    
    setLoading(true);
    // TODO: Replace with actual ID verification API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Store verified name for use in profile
    localStorage.setItem('jv_verified_name', extractedName);
    localStorage.setItem('jv_verified_dob', extractedDOB);
    
    setVerified(true);
    
    setTimeout(() => {
      navigate('/user/facial-recognition');
    }, 1500);
  };

  const handleSkip = () => {
    navigate('/user/facial-recognition');
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink/10 rounded-full blur-3xl animate-float" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-cyan" />
          <div className="w-8 h-0.5 bg-cyan" />
          <div className="w-3 h-3 rounded-full bg-cyan" />
          <div className="w-8 h-0.5 bg-cyan" />
          <div className="w-3 h-3 rounded-full bg-cyan" />
          <div className="w-8 h-0.5 bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
          <div className="w-8 h-0.5 bg-border" />
          <div className="w-3 h-3 rounded-full bg-border" />
        </div>

        <p className="text-center text-sm text-muted-foreground mb-4">Step 3 of 5</p>

        {/* Card */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan via-purple to-pink flex items-center justify-center shadow-lg shadow-cyan/30">
                  {verified ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <CreditCard className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan via-purple to-pink rounded-2xl blur opacity-40 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {verified ? 'ID Verified!' : 'Verify Your Identity'}
              </h1>
              <p className="text-muted-foreground">
                {verified 
                  ? 'Redirecting to facial recognition...'
                  : 'Upload your government-issued ID for verification'
                }
              </p>
            </div>

            {!verified && (
              <form onSubmit={handleVerify} className="space-y-6">
                {/* Front ID Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Scan className="w-4 h-4 text-cyan" />
                    Front of ID
                  </Label>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('front', e)}
                    className="hidden"
                  />
                  <div
                    onClick={() => frontInputRef.current?.click()}
                    className={`relative h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden group ${
                      frontImage 
                        ? 'border-cyan bg-cyan/5' 
                        : 'border-border hover:border-cyan/50 hover:bg-cyan/5'
                    }`}
                  >
                    {frontImage ? (
                      <>
                        <img src={frontImage} alt="Front ID" className="w-full h-full object-cover" />
                        {scanningFront && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-sm text-cyan">Extracting data...</p>
                            </div>
                          </div>
                        )}
                        {!scanningFront && (
                          <div className="absolute top-2 right-2 bg-green rounded-full p-1">
                            <FileCheck className="w-4 h-4 text-background" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground group-hover:text-cyan transition-colors">
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="text-sm">Click to upload front of ID</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Back ID Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Scan className="w-4 h-4 text-purple" />
                    Back of ID
                  </Label>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('back', e)}
                    className="hidden"
                  />
                  <div
                    onClick={() => backInputRef.current?.click()}
                    className={`relative h-40 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden group ${
                      backImage 
                        ? 'border-purple bg-purple/5' 
                        : 'border-border hover:border-purple/50 hover:bg-purple/5'
                    }`}
                  >
                    {backImage ? (
                      <>
                        <img src={backImage} alt="Back ID" className="w-full h-full object-cover" />
                        {scanningBack && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-8 h-8 border-2 border-purple/30 border-t-purple rounded-full animate-spin mx-auto mb-2" />
                              <p className="text-sm text-purple">Scanning...</p>
                            </div>
                          </div>
                        )}
                        {!scanningBack && (
                          <div className="absolute top-2 right-2 bg-green rounded-full p-1">
                            <FileCheck className="w-4 h-4 text-background" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground group-hover:text-purple transition-colors">
                        <Upload className="w-8 h-8 mb-2" />
                        <p className="text-sm">Click to upload back of ID</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extracted Data Preview */}
                {extractedName && !scanningFront && (
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
                    <div className="flex items-center gap-2 text-sm text-cyan font-medium">
                      <ShieldCheck className="w-4 h-4" />
                      Extracted Information
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="font-medium text-foreground">{extractedName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                        <p className="font-medium text-foreground">{extractedDOB}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This name will be used for your profile and cannot be changed.
                    </p>
                  </div>
                )}

                {/* Verify Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan via-purple to-pink hover:opacity-90 text-white font-semibold transition-all duration-300 group"
                  disabled={loading || !frontImage || !backImage || scanningFront || scanningBack}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying ID...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify & Continue
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>

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
                <div className="w-8 h-8 border-2 border-cyan/30 border-t-cyan rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
            <span className="text-xs text-muted-foreground">Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <Camera className="w-3.5 h-3.5 text-purple" />
            <span className="text-xs text-muted-foreground">AI-Powered OCR</span>
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

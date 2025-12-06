import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ArrowRight, ArrowLeft, Eye, EyeOff, Upload, X, Building2, FileText } from 'lucide-react';

export default function VenueSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [venueType, setVenueType] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [documents, setDocuments] = useState<File[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    // Store venue data for later steps
    localStorage.setItem('jv_user_type', 'venue');
    localStorage.setItem('jv_signup_email', email);
    localStorage.setItem('jv_venue_data', JSON.stringify({
      venueName,
      venueAddress,
      businessLicense,
      businessEmail,
      venueType,
      country,
      latitude,
      longitude,
      phone,
      fullName
    }));
    
    const result = await signUp(email, password, venueName);
    
    if (!result.error) {
      navigate('/venue/verify-email');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Branding */}
        <div className="lg:flex-1 flex flex-col justify-center px-8 py-8 lg:px-16 lg:py-0">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-2xl blur opacity-40" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Joint Vibe
                </h1>
                <p className="text-muted-foreground text-sm">Venue Management Platform</p>
              </div>
            </div>
            
            <p className="text-xl text-foreground/80 max-w-lg leading-relaxed">
              Register your venue to access our powerful management tools, POS system, and connect with customers.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-8 h-0.5 bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-8 h-0.5 bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-8 h-0.5 bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
            <div className="w-8 h-0.5 bg-border" />
            <div className="w-3 h-3 rounded-full bg-border" />
          </div>
          <p className="text-sm text-muted-foreground">Step 1 of 9 - Business Information</p>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-start justify-center px-8 py-8 lg:px-16 lg:overflow-y-auto">
          <div className="w-full max-w-lg">
            <div className="glass rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                {/* Badge */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Venue Registration</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground text-center mb-6">Register Your Venue</h2>

                {error && (
                  <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Document Upload */}
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Ownership Documents
                    </Label>
                    <div className="border-2 border-dashed border-border/50 rounded-xl p-4 hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        id="documents"
                        multiple
                        accept=".pdf,.jpg,.png,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="documents" className="flex flex-col items-center cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground text-center">
                          Upload business license, property deed, etc.
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, DOC</span>
                      </label>
                    </div>
                    {documents.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                            <span className="text-sm text-foreground truncate">{doc.name}</span>
                            <button type="button" onClick={() => removeDocument(index)} className="text-muted-foreground hover:text-destructive">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 bg-muted/50 border-border/50 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 bg-muted/50 border-border/50 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 bg-muted/50 border-border/50 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          minLength={6}
                          className="h-11 bg-muted/50 border-border/50 rounded-xl pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 bg-muted/50 border-border/50 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Venue Info */}
                  <div className="pt-4 border-t border-border/50">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4">Venue Details</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="venueName" className="text-foreground">Venue Name</Label>
                          <Input
                            id="venueName"
                            type="text"
                            placeholder="The Electric Lounge"
                            value={venueName}
                            onChange={(e) => setVenueName(e.target.value)}
                            required
                            disabled={loading}
                            className="h-11 bg-muted/50 border-border/50 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="venueType" className="text-foreground">Venue Type</Label>
                          <Select value={venueType} onValueChange={setVenueType} required>
                            <SelectTrigger className="h-11 bg-muted/50 border-border/50 rounded-xl">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nightclub">Nightclub</SelectItem>
                              <SelectItem value="bar">Bar</SelectItem>
                              <SelectItem value="restaurant">Restaurant</SelectItem>
                              <SelectItem value="lounge">Lounge</SelectItem>
                              <SelectItem value="concert_hall">Concert Hall</SelectItem>
                              <SelectItem value="pub">Pub</SelectItem>
                              <SelectItem value="cafe">Cafe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="venueAddress" className="text-foreground">Venue Address</Label>
                        <Input
                          id="venueAddress"
                          type="text"
                          placeholder="123 Party Street, Sydney NSW 2000"
                          value={venueAddress}
                          onChange={(e) => setVenueAddress(e.target.value)}
                          required
                          disabled={loading}
                          className="h-11 bg-muted/50 border-border/50 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="businessLicense" className="text-foreground">Business License #</Label>
                          <Input
                            id="businessLicense"
                            type="text"
                            placeholder="BL123456789"
                            value={businessLicense}
                            onChange={(e) => setBusinessLicense(e.target.value)}
                            required
                            disabled={loading}
                            className="h-11 bg-muted/50 border-border/50 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="businessEmail" className="text-foreground">Business Email</Label>
                          <Input
                            id="businessEmail"
                            type="email"
                            placeholder="business@venue.com"
                            value={businessEmail}
                            onChange={(e) => setBusinessEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="h-11 bg-muted/50 border-border/50 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country" className="text-foreground">Country</Label>
                          <Input
                            id="country"
                            type="text"
                            placeholder="Australia"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            disabled={loading}
                            className="h-11 bg-muted/50 border-border/50 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="latitude" className="text-foreground">Latitude</Label>
                          <Input
                            id="latitude"
                            type="text"
                            placeholder="-33.8688"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            disabled={loading}
                            className="h-11 bg-muted/50 border-border/50 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude" className="text-foreground">Longitude</Label>
                          <Input
                            id="longitude"
                            type="text"
                            placeholder="151.2093"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            disabled={loading}
                            className="h-11 bg-muted/50 border-border/50 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold text-base neon-glow transition-all duration-300 group mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign Up
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button type="button" onClick={() => navigate('/')} className="text-primary hover:underline font-medium">
                      Sign In
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

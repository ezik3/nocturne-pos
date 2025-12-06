import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Zap, Users, MapPin, Wallet, ArrowRight, Eye, EyeOff, Store, PartyPopper } from 'lucide-react';

type UserType = 'user' | 'venue' | null;

export default function AuthPage() {
  const [userType, setUserType] = useState<UserType>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Redirect based on stored user type or default
      const storedType = localStorage.getItem('jv_user_type');
      if (storedType === 'venue') {
        navigate('/venue/home');
      } else {
        navigate('/app/feed');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Store user type and email for verification flow
    if (userType) {
      localStorage.setItem('jv_user_type', userType);
    }
    localStorage.setItem('jv_signup_email', email);
    
    let result;
    if (isLogin) {
      result = await signIn(email, password);
      if (!result.error) {
        // Login goes directly to home
        if (userType === 'venue') {
          navigate('/venue/home');
        } else {
          navigate('/app/feed');
        }
      }
    } else {
      result = await signUp(email, password, fullName);
      if (!result.error) {
        // Signup goes to email verification
        if (userType === 'venue') {
          navigate('/venue/verify-email');
        } else {
          navigate('/user/verify-email');
        }
      }
    }
    
    setLoading(false);
  };

  const userFeatures = [
    { icon: MapPin, title: "Discover Venues", desc: "Find the hottest spots" },
    { icon: Users, title: "Connect", desc: "Meet new people" },
    { icon: Wallet, title: "JV Coin", desc: "Seamless payments" },
    { icon: Zap, title: "AI Waiter", desc: "Smart ordering" },
  ];

  const venueFeatures = [
    { icon: Store, title: "Manage Venue", desc: "Full control" },
    { icon: Users, title: "Staff Management", desc: "Organize your team" },
    { icon: Wallet, title: "Accept JV Coin", desc: "Low-fee payments" },
    { icon: Zap, title: "Smart POS", desc: "Built-in system" },
  ];

  // User type selection screen
  if (!userType) {
    return (
      <div className="min-h-screen w-full bg-background overflow-hidden relative flex items-center justify-center p-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 w-full max-w-4xl">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
                  <Sparkles className="w-9 h-9 text-primary-foreground" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-accent rounded-2xl blur opacity-40" />
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3">
              Joint Vibe
            </h1>
            <p className="text-xl text-muted-foreground">How would you like to join?</p>
          </div>

          {/* User type cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* End User Card */}
            <button
              onClick={() => setUserType('user')}
              className="group glass rounded-3xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <PartyPopper className="w-8 h-8 text-accent" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-2">I'm here to party</h2>
                <p className="text-muted-foreground mb-6">Discover venues, connect with people, and enjoy the nightlife</p>
                
                <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                  Get Started <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>

            {/* Venue Card */}
            <button
              onClick={() => setUserType('venue')}
              className="group glass rounded-3xl p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-2">I run a venue</h2>
                <p className="text-muted-foreground mb-6">Manage your business, staff, orders, and accept JV Coin payments</p>
                
                <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                  Get Started <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const features = userType === 'user' ? userFeatures : venueFeatures;

  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent/20 via-transparent to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Branding & Features */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-0">
          {/* Back button */}
          <button 
            onClick={() => setUserType(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors w-fit"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back
          </button>

          {/* Logo */}
          <div className="mb-12">
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
                <p className="text-muted-foreground text-sm">
                  {userType === 'user' ? 'The Social Nightlife Experience' : 'Venue Management Platform'}
                </p>
              </div>
            </div>
            
            <p className="text-xl lg:text-2xl text-foreground/80 max-w-lg leading-relaxed">
              {userType === 'user' 
                ? 'Discover venues, connect with people, and experience nightlife like never before.'
                : 'Manage your venue, staff, and orders with our powerful all-in-one platform.'
              }
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-4 rounded-2xl glass glass-hover cursor-pointer transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12 lg:px-16">
          <div className="w-full max-w-md">
            {/* Auth card */}
            <div className="glass rounded-3xl p-8 lg:p-10 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                {/* Toggle */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex p-1 bg-muted/50 rounded-full">
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        isLogin 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        !isLogin 
                          ? 'bg-primary text-primary-foreground shadow-lg' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    {isLogin ? 'Welcome back!' : userType === 'user' ? 'Join the vibe' : 'Register your venue'}
                  </h2>
                  <p className="text-muted-foreground">
                    {isLogin 
                      ? 'Enter your details to continue' 
                      : 'Create your account to get started'
                    }
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-foreground">
                        {userType === 'user' ? 'Full Name' : 'Venue / Business Name'}
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder={userType === 'user' ? 'Enter your name' : 'Enter venue name'}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                        disabled={loading}
                        className="h-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      />
                    </div>
                  )}

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
                      className="h-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                  
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
                        className="h-12 bg-muted/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {isLogin && (
                    <div className="flex justify-end">
                      <button type="button" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold text-base neon-glow transition-all duration-300 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">or continue with</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Social logins */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 rounded-xl border-border/50 hover:bg-muted/50 transition-all"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 rounded-xl border-border/50 hover:bg-muted/50 transition-all"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                    </svg>
                    Apple
                  </Button>
                </div>

                {/* Terms */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                  By continuing, you agree to our{' '}
                  <button type="button" className="text-primary hover:underline">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
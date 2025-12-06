import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Key, 
  CheckCircle, 
  ArrowRight, 
  Copy, 
  Eye, 
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Download,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

// BIP39 word list (simplified - in production use the full 2048 words)
const wordList = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
  'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
  'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest',
  'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset',
  'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
  'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake',
  'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge',
  'bag', 'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain',
  'barrel', 'base', 'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become',
  'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit',
  'best', 'betray', 'better', 'between', 'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology',
  'bird', 'birth', 'bitter', 'black', 'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless',
  'blind', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body',
  'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow', 'boss',
  'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread',
  'breeze', 'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze',
  'broom', 'brother', 'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb',
  'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy',
  'butter', 'buyer', 'buzz', 'cabbage', 'cabin', 'cable', 'cactus', 'cage', 'cake', 'call',
  'calm', 'camera', 'camp', 'can', 'canal', 'cancel', 'candy', 'cannon', 'canoe', 'canvas',
  'canyon', 'capable', 'capital', 'captain', 'car', 'carbon', 'card', 'cargo', 'carpet', 'carry',
  'cart', 'case', 'cash', 'casino', 'castle', 'casual', 'cat', 'catalog', 'catch', 'category',
  'cattle', 'caught', 'cause', 'caution', 'cave', 'ceiling', 'celery', 'cement', 'census', 'century',
  'cereal', 'certain', 'chair', 'chalk', 'champion', 'change', 'chaos', 'chapter', 'charge', 'chase',
  'chat', 'cheap', 'check', 'cheese', 'chef', 'cherry', 'chest', 'chicken', 'chief', 'child',
  'chimney', 'choice', 'choose', 'chronic', 'chuckle', 'chunk', 'churn', 'cigar', 'cinnamon', 'circle',
  'citizen', 'city', 'civil', 'claim', 'clap', 'clarify', 'claw', 'clay', 'clean', 'clerk',
  'clever', 'click', 'client', 'cliff', 'climb', 'clinic', 'clip', 'clock', 'clog', 'close',
  'cloth', 'cloud', 'clown', 'club', 'clump', 'cluster', 'clutch', 'coach', 'coast', 'coconut',
  'code', 'coffee', 'coil', 'coin', 'collect', 'color', 'column', 'combine', 'come', 'comfort'
];

function generateSeedPhrase(): string[] {
  const words: string[] = [];
  const usedIndices = new Set<number>();
  
  while (words.length < 12) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    if (!usedIndices.has(randomIndex)) {
      usedIndices.add(randomIndex);
      words.push(wordList[randomIndex]);
    }
  }
  
  return words;
}

export default function VenuePrivateKeyGeneration() {
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [showPhrase, setShowPhrase] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [complete, setComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate key generation
    const timer = setTimeout(() => {
      setSeedPhrase(generateSeedPhrase());
      setGenerating(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase.join(' '));
    setCopied(true);
    toast.success('Recovery phrase copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const venueName = localStorage.getItem('jv_venue_name') || 'Unknown Venue';
    const content = `JOINT VIBE - VENUE RECOVERY PHRASE\n${'='.repeat(40)}\n\nVenue: ${venueName}\n\nKEEP THIS SECURE - NEVER SHARE WITH ANYONE\n\nYour 12-word recovery phrase:\n\n${seedPhrase.map((word, i) => `${i + 1}. ${word}`).join('\n')}\n\n${'='.repeat(40)}\nGenerated: ${new Date().toISOString()}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'joint-vibe-venue-recovery-phrase.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recovery phrase downloaded');
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setComplete(true);
    
    // Store that venue has completed wallet setup
    localStorage.setItem('jv_venue_wallet_setup', 'complete');
    
    setTimeout(() => {
      navigate('/venue/profile-setup');
    }, 2000);
  };

  const handleSkip = () => {
    navigate('/venue/profile-setup');
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

      <div className="relative z-10 w-full max-w-xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${i < 8 ? 'bg-primary' : 'bg-primary'}`} />
              {i < 8 && <div className={`w-6 h-0.5 ${i < 7 ? 'bg-primary' : 'bg-primary'}`} />}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-4">Step 8 of 9 - Final Step!</p>

        {/* Card */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple/20 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Venue badge */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-primary">Venue Wallet</span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple via-gold to-orange flex items-center justify-center shadow-lg shadow-purple/30">
                  {complete ? (
                    <CheckCircle className="w-10 h-10 text-white" />
                  ) : (
                    <Key className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple via-gold to-orange rounded-2xl blur opacity-40 animate-pulse" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {complete ? 'Venue Wallet Created!' : 'Venue Recovery Phrase'}
              </h1>
              <p className="text-muted-foreground">
                {complete 
                  ? 'Redirecting to your venue dashboard...'
                  : 'Secure your venue wallet with this 12-word phrase.'
                }
              </p>
            </div>

            {!complete && (
              <>
                {/* Warning Banner */}
                <div className="mb-6 p-4 rounded-xl bg-orange/10 border border-orange/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange mb-1">Enterprise Security Notice</p>
                      <p className="text-muted-foreground">
                        This phrase controls access to all venue funds. Store it in a secure location. 
                        Consider using a hardware wallet or secure vault for enterprise security.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seed Phrase Display */}
                {generating ? (
                  <div className="p-8 rounded-xl bg-secondary/50 border border-border flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-purple/30 border-t-purple rounded-full animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">Generating enterprise-grade recovery phrase...</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className={`p-6 rounded-xl bg-secondary/50 border border-border transition-all duration-300 ${!showPhrase ? 'blur-md select-none' : ''}`}>
                      <div className="grid grid-cols-3 gap-3">
                        {seedPhrase.map((word, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50">
                            <span className="text-xs text-muted-foreground font-mono w-5">{index + 1}.</span>
                            <span className="font-mono text-sm text-foreground">{word}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {!showPhrase && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setShowPhrase(true)}
                          className="gap-2 border-purple/50 text-purple hover:bg-purple/10"
                        >
                          <Eye className="w-4 h-4" />
                          Reveal Recovery Phrase
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {showPhrase && !generating && (
                  <div className="mt-6 space-y-4">
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleCopy}
                        className="flex-1 gap-2 border-purple/50 text-purple hover:bg-purple/10"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDownload}
                        className="flex-1 gap-2 border-gold/50 text-gold hover:bg-gold/10"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowPhrase(false)}
                        className="gap-2 border-border text-muted-foreground hover:bg-secondary"
                      >
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </Button>
                    </div>

                    {/* Confirmation Checkbox */}
                    <label className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border cursor-pointer hover:bg-secondary/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-border text-purple focus:ring-purple"
                      />
                      <span className="text-sm text-muted-foreground">
                        I have securely stored my 12-word recovery phrase and understand that 
                        this is the only way to recover access to my venue's funds.
                      </span>
                    </label>

                    {/* Continue Button */}
                    <Button 
                      onClick={handleConfirm}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-purple via-gold to-orange hover:opacity-90 text-white font-semibold transition-all duration-300 group"
                      disabled={!confirmed}
                    >
                      <span className="flex items-center gap-2">
                        Complete Venue Setup
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
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
                  </div>
                )}
              </>
            )}

            {complete && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <ShieldCheck className="w-3.5 h-3.5 text-purple" />
            <span className="text-xs text-muted-foreground">Enterprise Grade</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
            <Lock className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs text-muted-foreground">Multi-Sig Ready</span>
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

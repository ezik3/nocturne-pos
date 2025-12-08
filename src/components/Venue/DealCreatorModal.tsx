import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Image as ImageIcon, Video, Type, Percent, Calendar, MapPin, 
  Eye, Smartphone, ChevronLeft, ChevronRight, Upload, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DealCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCredits: number;
}

type AdFormat = 'image' | 'video' | 'carousel';
type PreviewPlatform = 'feed' | 'stories' | 'search';

export default function DealCreatorModal({ isOpen, onClose, availableCredits }: DealCreatorModalProps) {
  const [step, setStep] = useState<'format' | 'creative' | 'details' | 'preview'>('format');
  const [adFormat, setAdFormat] = useState<AdFormat>('image');
  const [previewPlatform, setPreviewPlatform] = useState<PreviewPlatform>('feed');
  
  const [adData, setAdData] = useState({
    headline: '',
    description: '',
    callToAction: 'REDEEM',
    discount: '',
    validUntil: '',
    mediaUrl: '',
    terms: '',
  });

  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedMedia(url);
    }
  };

  const handlePublish = () => {
    if (!adData.headline || !adData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Deal published! It will appear in customer feeds shortly.");
    onClose();
  };

  const renderFormatStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Ad Format</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Select how you'd like to structure your deal post
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'image' as AdFormat, icon: ImageIcon, label: 'Single Image or Video', desc: 'One image or video, or a slideshow with multiple images' },
          { type: 'carousel' as AdFormat, icon: Video, label: 'Carousel', desc: '2 or more scrollable images or videos' },
          { type: 'video' as AdFormat, icon: Sparkles, label: 'Collection', desc: 'Group of items that opens into a fullscreen mobile experience' },
        ].map((format) => (
          <Card 
            key={format.type}
            className={`cursor-pointer transition-all hover:border-primary ${adFormat === format.type ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
            onClick={() => setAdFormat(format.type)}
          >
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${adFormat === format.type ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                <format.icon className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-2">{format.label}</h4>
              <p className="text-xs text-muted-foreground">{format.desc}</p>
              {adFormat === format.type && (
                <Badge className="mt-3 bg-primary">Selected</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-blue-400">Multi-advertiser ads (recommended)</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Enabling this may increase your ad's exposure to people in a shopping mindset by allowing this ad to appear alongside ads from multiple businesses.
        </p>
      </div>
    </div>
  );

  const renderCreativeStep = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Creative Editor */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Ad Creative</h3>
          <p className="text-sm text-muted-foreground">
            Select the media and text for your ad. You can also customize your media and text for each placement.
          </p>
        </div>

        {/* Media Upload */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Media
          </Label>
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            {uploadedMedia ? (
              <div className="relative">
                <img src={uploadedMedia} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={(e) => { e.stopPropagation(); setUploadedMedia(null); }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">Click to upload media</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, GIF, or MP4</p>
              </>
            )}
          </div>
          <input 
            id="media-upload" 
            type="file" 
            accept="image/*,video/*" 
            className="hidden" 
            onChange={handleMediaUpload}
          />
        </div>

        {/* Text Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Headline *</Label>
            <Input 
              placeholder="e.g., 50% OFF All Drinks Tonight!" 
              value={adData.headline}
              onChange={(e) => setAdData({ ...adData, headline: e.target.value })}
              maxLength={40}
            />
            <p className="text-xs text-muted-foreground text-right">{adData.headline.length}/40</p>
          </div>

          <div className="space-y-2">
            <Label>Primary Text *</Label>
            <Textarea 
              placeholder="Describe your deal..."
              value={adData.description}
              onChange={(e) => setAdData({ ...adData, description: e.target.value })}
              maxLength={125}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">{adData.description.length}/125</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Percent className="w-4 h-4" /> Discount Value
              </Label>
              <Input 
                placeholder="e.g., 50% OFF"
                value={adData.discount}
                onChange={(e) => setAdData({ ...adData, discount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Valid Until
              </Label>
              <Input 
                type="date"
                value={adData.validUntil}
                onChange={(e) => setAdData({ ...adData, validUntil: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <Textarea 
              placeholder="Optional: Add redemption terms..."
              value={adData.terms}
              onChange={(e) => setAdData({ ...adData, terms: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ad Preview</h3>
          <div className="flex gap-2">
            {(['feed', 'stories', 'search'] as PreviewPlatform[]).map((platform) => (
              <Button
                key={platform}
                variant={previewPlatform === platform ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewPlatform(platform)}
              >
                {platform === 'feed' && 'Profile feed'}
                {platform === 'stories' && 'Stories'}
                {platform === 'search' && 'Search'}
              </Button>
            ))}
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="bg-black rounded-3xl p-3 max-w-[300px] mx-auto">
          <div className="bg-slate-900 rounded-2xl overflow-hidden">
            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 text-white text-xs">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 border border-white rounded-sm">
                  <div className="w-2 h-full bg-white" />
                </div>
              </div>
            </div>

            {/* Post Preview */}
            <div className="bg-slate-800">
              {/* Header */}
              <div className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  EL
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">The Electric Lounge</p>
                  <p className="text-xs text-gray-400">Sponsored • <MapPin className="w-3 h-3 inline" /> 2km away</p>
                </div>
              </div>

              {/* Media */}
              <div className="aspect-square bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                {uploadedMedia ? (
                  <img src={uploadedMedia} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-white/40" />
                    <p className="text-white/60 text-sm">Your media here</p>
                  </div>
                )}
                {adData.discount && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">
                    {adData.discount}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3 space-y-2">
                <p className="font-bold text-white text-lg">
                  {adData.headline || 'Your headline here'}
                </p>
                <p className="text-gray-300 text-sm">
                  {adData.description || 'Your description will appear here...'}
                </p>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold mt-2">
                  {adData.callToAction}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Ad rendering and interaction may vary based on device, format and other factors.
        </p>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Deal Details</h3>
        <p className="text-sm text-muted-foreground">
          Configure targeting and redemption settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Reach Settings
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Your deal will reach customers within your purchased notification radius.
            </p>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <p className="font-medium">Available Credits: <span className="text-primary">{availableCredits}</span></p>
              <p className="text-xs text-muted-foreground mt-1">Each push costs 1 credit</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Scheduling
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" className="flex-1">Push Now</Button>
                <Button variant="outline" className="flex-1">Schedule</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Push immediately or schedule for a specific time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/20 mx-auto flex items-center justify-center">
        <Eye className="w-10 h-10 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold">Ready to Publish!</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Your deal will be pushed to {availableCredits} customers within your target area. 
        They'll see it in their feed and can redeem it instantly.
      </p>

      <Card className="max-w-md mx-auto border-primary/50">
        <CardContent className="p-6 text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Headline</span>
            <span className="font-medium">{adData.headline || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium">{adData.discount || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valid Until</span>
            <span className="font-medium">{adData.validUntil || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Credits Used</span>
            <span className="font-medium text-primary">1</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const steps = ['format', 'creative', 'details', 'preview'] as const;
  const currentStepIndex = steps.indexOf(step);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-5xl my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass border-border">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    Create Deal Ad
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {steps.map((s, i) => (
                      <div key={s} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          i <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                        }`}>
                          {i + 1}
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`w-12 h-1 mx-2 ${i < currentStepIndex ? 'bg-primary' : 'bg-secondary'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>

              <CardContent className="p-6 min-h-[500px]">
                {step === 'format' && renderFormatStep()}
                {step === 'creative' && renderCreativeStep()}
                {step === 'details' && renderDetailsStep()}
                {step === 'preview' && renderPreviewStep()}
              </CardContent>

              {/* Footer Navigation */}
              <div className="border-t border-border p-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentStepIndex > 0) {
                      setStep(steps[currentStepIndex - 1]);
                    } else {
                      onClose();
                    }
                  }}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {currentStepIndex === 0 ? 'Cancel' : 'Back'}
                </Button>

                {step === 'preview' ? (
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black" onClick={handlePublish}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Publish Deal
                  </Button>
                ) : (
                  <Button onClick={() => setStep(steps[currentStepIndex + 1])}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

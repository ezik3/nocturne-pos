import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ScanFace, ShieldCheck, Loader2, ArrowLeft, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceId, setShowFaceId] = useState(false);
  const [faceIdScanning, setFaceIdScanning] = useState(false);
  const [venueName, setVenueName] = useState("The Electric Lounge"); // From localStorage/context

  // Check if Web Authentication API (Face ID / Biometrics) is available
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  
  useEffect(() => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => setBiometricsAvailable(available))
        .catch(() => setBiometricsAvailable(false));
    }
  }, []);

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      
      // Auto-submit when 6 digits entered
      if (newPin.length === 6) {
        handlePinLogin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handlePinLogin = async (enteredPin: string) => {
    setIsLoading(true);
    
    // Simulate PIN validation - in production, call API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo, accept any 6-digit PIN
    if (enteredPin.length === 6) {
      // Store work mode session
      localStorage.setItem("work_mode", "true");
      localStorage.setItem("work_mode_role", "waiter");
      localStorage.setItem("work_mode_venue", venueName);
      localStorage.setItem("work_mode_start", new Date().toISOString());
      
      toast.success("Welcome! You're now in Work Mode");
      navigate("/venue/pos/dashboard");
    } else {
      toast.error("Invalid PIN. Please try again.");
      setPin("");
    }
    
    setIsLoading(false);
  };

  const handleFaceIdLogin = async () => {
    setShowFaceId(true);
    setFaceIdScanning(true);

    try {
      // Check if WebAuthn is available
      if (!window.PublicKeyCredential) {
        throw new Error("Biometric authentication not supported");
      }

      // In production, this would use WebAuthn API
      // For demo, simulate face scanning
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful authentication
      localStorage.setItem("work_mode", "true");
      localStorage.setItem("work_mode_role", "waiter");
      localStorage.setItem("work_mode_venue", venueName);
      localStorage.setItem("work_mode_start", new Date().toISOString());
      
      toast.success("Face ID verified! Welcome to Work Mode");
      navigate("/venue/pos/dashboard");
      
    } catch (error) {
      toast.error("Face ID authentication failed. Please use your PIN.");
      setShowFaceId(false);
    }
    
    setFaceIdScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Work Mode Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your PIN to clock in at <span className="text-primary font-medium">{venueName}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {showFaceId ? (
                <motion.div
                  key="faceid"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-8"
                >
                  <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center ${
                    faceIdScanning ? "border-blue-500 animate-pulse" : "border-slate-600"
                  }`}>
                    <ScanFace className={`w-16 h-16 ${faceIdScanning ? "text-blue-400" : "text-slate-400"}`} />
                  </div>
                  <p className="mt-4 text-lg font-medium text-white">
                    {faceIdScanning ? "Scanning..." : "Position your face"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Look directly at the camera
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() => setShowFaceId(false)}
                    className="mt-6 text-slate-400"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Use PIN instead
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="pin"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6"
                >
                  {/* PIN Display */}
                  <div className="flex justify-center gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                          i < pin.length
                            ? "border-primary bg-primary/20 text-white"
                            : "border-slate-600 bg-slate-700/50"
                        }`}
                      >
                        {i < pin.length ? "•" : ""}
                      </div>
                    ))}
                  </div>

                  {/* Number Pad */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        className="h-14 text-xl font-bold border-slate-600 bg-slate-700/50 hover:bg-slate-600 text-white"
                        onClick={() => handlePinInput(num.toString())}
                        disabled={isLoading}
                      >
                        {num}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      className="h-14 border-slate-600 bg-slate-700/50 hover:bg-slate-600 text-white"
                      onClick={handleBackspace}
                      disabled={isLoading}
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 text-xl font-bold border-slate-600 bg-slate-700/50 hover:bg-slate-600 text-white"
                      onClick={() => handlePinInput("0")}
                      disabled={isLoading}
                    >
                      0
                    </Button>
                    <Button
                      className="h-14 bg-primary hover:bg-primary/90"
                      onClick={() => pin.length === 6 && handlePinLogin(pin)}
                      disabled={pin.length < 6 || isLoading}
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    </Button>
                  </div>

                  {/* Face ID Option */}
                  {biometricsAvailable && (
                    <div className="pt-4 border-t border-slate-700">
                      <Button
                        variant="outline"
                        className="w-full h-14 border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                        onClick={handleFaceIdLogin}
                      >
                        <ScanFace className="w-5 h-5 mr-2" />
                        Use Face ID
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center pt-4 border-t border-slate-700">
              <Button
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="text-slate-400 hover:text-white"
              >
                <User className="w-4 h-4 mr-2" /> Not an employee? Sign in normally
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-4">
          Work Mode provides access to POS features only. Social features are disabled during shifts.
        </p>
      </motion.div>
    </div>
  );
}

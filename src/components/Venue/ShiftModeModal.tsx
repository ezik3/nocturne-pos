import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, DollarSign, ShoppingCart, LogOut, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface ShiftModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName: string;
  employeeRole: string;
  onStartShift: () => void;
}

export default function ShiftModeModal({ 
  isOpen, 
  onClose, 
  venueName, 
  employeeRole,
  onStartShift 
}: ShiftModeModalProps) {
  const [isClockingIn, setIsClockingIn] = useState(false);

  const handleStartShift = async () => {
    setIsClockingIn(true);
    // Simulate geolocation check
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsClockingIn(false);
    toast.success("You're now on shift!");
    onStartShift();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            🏢 Ready to Start Your Shift?
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            You have employee access at this venue
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">{venueName}</h3>
            <p className="text-primary font-medium capitalize">{employeeRole}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto text-blue-400 mb-2" />
              <p className="text-sm text-slate-400">Shift Time</p>
              <p className="font-bold">6:00 PM - 2:00 AM</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 mx-auto text-green-400 mb-2" />
              <p className="text-sm text-slate-400">Location</p>
              <p className="font-bold text-green-400">At Venue ✓</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleStartShift}
            disabled={isClockingIn}
            className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg font-bold"
          >
            {isClockingIn ? (
              <>
                <MapPin className="mr-2 h-5 w-5 animate-pulse" />
                Verifying Location...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start Shift
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-slate-600 text-slate-300"
          >
            Not Now
          </Button>
        </div>

        <p className="text-xs text-center text-slate-500">
          Your location will be verified to confirm you're at the venue
        </p>
      </DialogContent>
    </Dialog>
  );
}

// Clock Out Modal Component
interface ClockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftData: {
    hoursWorked: string;
    ordersServed: number;
    totalSales: number;
  };
  onConfirmClockOut: () => void;
}

export function ClockOutModal({ isOpen, onClose, shiftData, onConfirmClockOut }: ClockOutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            End Your Shift?
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            Here's your shift summary
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto text-blue-400 mb-2" />
              <p className="text-xs text-slate-400">Hours</p>
              <p className="font-bold text-lg">{shiftData.hoursWorked}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <ShoppingCart className="h-6 w-6 mx-auto text-orange-400 mb-2" />
              <p className="text-xs text-slate-400">Orders</p>
              <p className="font-bold text-lg">{shiftData.ordersServed}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto text-green-400 mb-2" />
              <p className="text-xs text-slate-400">Sales</p>
              <p className="font-bold text-lg">${shiftData.totalSales}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onConfirmClockOut}
            className="w-full h-12 bg-red-500 hover:bg-red-600 text-lg font-bold"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Confirm Clock Out
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-slate-600 text-slate-300"
          >
            <Pause className="mr-2 h-4 w-4" />
            Continue Working
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { AnimatePresence } from "framer-motion";
import CheckInTransition from "./CheckInTransition";
import VenueShell from "./VenueShell";

interface VibeSphereProps {
  isCheckedIn: boolean;
  isTransitioning: boolean;
  venueName: string;
  venueType?: string;
  vibeLevel?: string;
  priceLevel?: string;
  hours?: string;
  venueId?: string;
  onExit: () => void;
}

const VibeSphere = ({
  isCheckedIn,
  isTransitioning,
  venueName,
  venueType,
  vibeLevel,
  priceLevel,
  hours,
  venueId,
  onExit,
}: VibeSphereProps) => {
  return (
    <>
      {/* Check-in Transition Animation */}
      <CheckInTransition
        isVisible={isTransitioning}
        venueName={venueName}
        venueType={venueType}
        vibeLevel={vibeLevel}
      />

      {/* Immersive Venue Shell */}
      <AnimatePresence>
        {isCheckedIn && !isTransitioning && (
          <VenueShell
            venueName={venueName}
            venueType={venueType}
            vibeLevel={vibeLevel}
            priceLevel={priceLevel}
            hours={hours}
            venueId={venueId}
            onExit={onExit}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default VibeSphere;

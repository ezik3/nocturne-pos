import { ReactNode } from "react";
import VenueSidebar from "./VenueSidebar";

interface VenueLayoutProps {
  children: ReactNode;
}

export default function VenueLayout({ children }: VenueLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <VenueSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

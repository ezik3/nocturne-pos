import { ReactNode } from "react";
import { POSProvider } from "@/contexts/POSContext";
import Sidebar from "./Sidebar";

interface POSLayoutProps {
  children: ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
  return (
    <POSProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </POSProvider>
  );
}

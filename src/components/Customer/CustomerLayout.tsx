import { ReactNode } from "react";

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content - Navbar is now handled by individual pages like Feed */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;

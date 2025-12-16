import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background dark">
      <AdminSidebar />
      <div className="lg:pl-64 pl-16">
        <AdminHeader />
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

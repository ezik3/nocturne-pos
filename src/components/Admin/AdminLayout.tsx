import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-slate-950">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-slate-900">
        {children}
      </main>
    </div>
  );
}

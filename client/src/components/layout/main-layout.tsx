import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-64 bg-neutral-100 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

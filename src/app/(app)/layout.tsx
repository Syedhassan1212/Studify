import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="flex min-h-[calc(100vh-48px)] flex-col gap-6">
        <Topbar />
        <main className="flex flex-1 flex-col gap-6 pb-10">{children}</main>
      </div>
    </div>
  );
}

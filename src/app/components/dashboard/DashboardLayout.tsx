import { Outlet } from "react-router";
import { DashboardSidebar } from "./DashboardSidebar";
import { ProtectedRoute } from "../auth/ProtectedRoute";

export function DashboardLayout() {
  return (
    <ProtectedRoute requireOnboarding>
      <div className="min-h-screen bg-gradient-to-br from-orange-50/80 via-amber-50/60 to-yellow-50/80">
        <DashboardSidebar />
        <main className="min-h-screen pl-[72px] transition-[padding] duration-250">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/UserAvatar";

export function AppLayout() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  // Clears the current session and sends the user back to the landing page.
  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <div className="flex flex-1 flex-col">
          {/* Shared top bar for all authenticated pages. */}
          <header className="flex h-14 items-center justify-between border-b px-4">
            <SidebarTrigger />

            <div className="flex items-center gap-3">
              <UserAvatar fullName={profile?.full_name} email={user?.email} />

              <Button type="button" variant="outline" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          </header>

          {/* Nested authenticated routes render here. */}
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
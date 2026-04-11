import {
  LayoutDashboard,
  PenSquare,
  TrendingUp,
  Settings,
  Users,
  BarChart3,
  Brain,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const patientItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: LayoutDashboard },
  { title: "Check-in", url: "/patient/checkin", icon: PenSquare },
  { title: "My Trends", url: "/patient/trends", icon: TrendingUp },
  { title: "Settings", url: "/settings", icon: Settings },
];

const professionalItems = [
  { title: "Dashboard", url: "/professional/dashboard", icon: LayoutDashboard },
  { title: "Patients", url: "/professional/patients", icon: Users },
  { title: "Population Data", url: "/population", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { role, profile, signOut } = useAuth();

  const items = role === "professional" ? professionalItems : patientItems;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              {!collapsed && (
                <span className="font-bold text-foreground">Healthy Minds</span>
              )}
            </div>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/settings"}
                      className="hover:bg-accent"
                      activeClassName="bg-accent text-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && profile?.full_name && (
          <div className="px-3 py-2 text-sm">
            <p className="font-medium text-foreground">{profile.full_name}</p>
            <p className="text-xs capitalize text-muted-foreground">{role}</p>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Log out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
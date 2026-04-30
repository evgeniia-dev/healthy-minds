import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "patient" | "professional";

export function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role?: AppRole;
}) {
  const { user, loading } = useAuth();

  // Wait until auth state is checked before deciding where to redirect.
  if (loading) {
    return null;
  }

  // If there is no logged-in user, it will send them to login/register page.
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If route is role-specific, it will block users with the wrong role.
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // If everything is valid, it will show the protected page.
  return children;
}
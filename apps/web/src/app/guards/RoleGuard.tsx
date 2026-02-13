import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import type { UserRole } from "../../lib/types";

export function RoleGuard({ allow }: { allow: UserRole[] }): JSX.Element {
  const { role } = useAuth();
  const location = useLocation();

  if (!role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allow.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

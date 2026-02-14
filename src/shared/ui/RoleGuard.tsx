import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { UserRole } from "@/features/auth/data/mockUsers";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const defaultRoutes: Record<UserRole, string> = {
  mesero: "/ordenes",
  cajero: "/ordenes",
  admin: "/",
};

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={defaultRoutes[user.role]} replace />;
  }

  return <>{children}</>;
};

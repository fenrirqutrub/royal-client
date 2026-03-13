import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import Loader from "../components/ui/Loader";
import { useAuth } from "../context/AuthContext";
import type { AuthUser } from "../context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: AuthUser["role"][];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // owner সবসময় সব route access পাবে
  if (user.role === "owner") {
    return <>{children}</>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

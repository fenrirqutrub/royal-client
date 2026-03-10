// src/router/PrivateRoute.tsx
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../hooks/UseAuth";
import Loader from "../components/ui/Loader";

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "principal" | "teacher" | "super-admin")[];
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] ">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

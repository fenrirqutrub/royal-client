import type { ReactNode } from "react";
import { Navigate } from "react-router";

const AUTH_KEY = "admin_auth_token";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem(AUTH_KEY);

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

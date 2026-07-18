import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Loading } from "./ui.jsx";

export function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <Loading label="Checking your session" />;

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return children;
}

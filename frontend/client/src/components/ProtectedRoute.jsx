import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // still checking the saved login when the page opens
  if (loading) {
    return <p role="status">Loading player data...</p>;
  }

  // not logged in: go to login, and remember where the player wanted to go
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

const PublicRoute = () => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  return authenticated ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;

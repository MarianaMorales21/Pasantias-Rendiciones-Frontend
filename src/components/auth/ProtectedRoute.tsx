import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return authenticated ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;

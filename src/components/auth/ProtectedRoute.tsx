import { useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { authenticated, loading, verifySession } = useAuth();

  // Forzar verificación al cargar desde bfcache (botón atrás del navegador)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        verifySession();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

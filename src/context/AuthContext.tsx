import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { helpHttp, isApiError, ApiResponse } from "../helpers/helpHttp";
import { API_BASE_URL } from "../api/apiConfig";
import { UserItem } from "../types/user";

interface AuthContextType {
  user: UserItem | null;
  loading: boolean;
  authenticated: boolean;
  login: (ced_usu: string, cla_usu: string) => Promise<void>;
  register: (data: Partial<UserItem>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  verifySession: () => Promise<void>;
  forgotPasswordByCedula: (ced_usu: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const api = helpHttp();

  const verifySession = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${API_BASE_URL}/auth/profile`) as ApiResponse<UserItem>;

      if (!isApiError(response)) {
        setUser(response);
        setAuthenticated(true);
      } else {
        setUser(null);
        setAuthenticated(false);
      }
    } catch (error) {
      console.error("Session verification failed:", error);
      setUser(null);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (ced_usu: string, cla_usu: string) => {
    const response = await api.post(`${API_BASE_URL}/auth/login`, {
      body: { ced_usu, cla_usu },
    }) as ApiResponse<UserItem>;

    if (isApiError(response)) {
      throw new Error(response.statusText || "Error al iniciar sesión");
    }

    // Establecer el usuario y marcar como autenticado inmediatamente
    setUser(response);
    setAuthenticated(true);
    setLoading(false); 
  };

  const register = async (data: Partial<UserItem>) => {
    const response = await api.post(`${API_BASE_URL}/auth/register`, {
      body: data,
    }) as ApiResponse<UserItem>;

    if (isApiError(response)) {
      throw new Error(response.statusText || "Error al registrar usuario");
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    const response = await api.post(`${API_BASE_URL}/auth/change-password`, {
      body: { oldPassword, newPassword },
    }) as ApiResponse<{ message: string }>;

    if (isApiError(response)) {
      throw new Error(response.statusText || "Error al cambiar la contraseña");
    }

    // Cerrar sesión después de cambiar contraseña
    await logout();
  };

  const forgotPasswordByCedula = async (ced_usu: string): Promise<{ message: string }> => {
    const response = await api.post(`${API_BASE_URL}/auth/forgot-password-by-cedula`, {
      body: { ced_usu },
      timeout: 30000,
    }) as ApiResponse<{ message: string }>;

    if (isApiError(response)) {
      throw new Error(response.statusText || "Error al recuperar contraseña");
    }

    return response;
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAuthenticated(false);
      setLoading(false);
      localStorage.removeItem("user");
    }
  };

  // Forzar verificación de sesión cuando la página se carga desde bfcache
  // (evita que el botón "atrás" muestre una sesión ya cerrada)
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

  // Verificar sesión al montar el componente
  useEffect(() => {
    verifySession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, authenticated, login, register, changePassword, forgotPasswordByCedula, logout, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import { useState, useEffect } from "react";
import { authoritiesService } from "../services/authoritiesService";
import { AuthorityItem } from "../types/authorities";
import { isApiError } from "../helpers/helpHttp";

export const useAuthorities = () => {
    const [authorities, setAuthorities] = useState<AuthorityItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Warning modal states to replace alerts
    const [warningMessage, setWarningMessage] = useState("");
    const [isWarningOpen, setIsWarningOpen] = useState(false);

    const fetchAuthorities = async () => {
        setIsLoading(true);
        try {
            const response = await authoritiesService.getAll();
            if (isApiError(response)) {
                setError(response.statusText || "Error al cargar autoridades");
            } else {
                setAuthorities(response || []);
                setError(null);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de conexión";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id: number, data: Partial<AuthorityItem>) => {
        setIsLoading(true);
        try {
            const response = await authoritiesService.update(id, data);
            if (isApiError(response)) {
                setWarningMessage("Error al actualizar: " + (response.statusText || "Error desconocido"));
                setIsWarningOpen(true);
                return false;
            }
            await fetchAuthorities();
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de red";
            setWarningMessage("Error al actualizar: " + message);
            setIsWarningOpen(true);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthorities();
    }, []);

    return {
        authorities,
        isLoading,
        error,
        fetchAuthorities,
        handleUpdate,
        warningMessage,
        isWarningOpen,
        setIsWarningOpen
    };
};

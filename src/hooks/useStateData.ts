import { useState, useEffect } from "react";
import { stateService } from "../services/stateService";
import { StateItem } from "../types/state";
import { isApiError } from "../helpers/helpHttp";

export const useStateData = () => {
    const [data, setData] = useState<StateItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await stateService.getAll();
            if (isApiError(response)) {
                setError(response.statusText || "Error al cargar estados");
            } else {
                setData(response || []);
                setError(null);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de conexión";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, isLoading, error, fetchData };
};

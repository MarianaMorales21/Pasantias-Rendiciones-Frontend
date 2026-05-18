import { useState, useEffect } from "react";
import { departureService } from "../services/departureService";
import { departureItem } from "../types/departure";
import { isApiError } from "../helpers/helpHttp";

export const useDepartures = () => {
    const [departures, setDepartures] = useState<departureItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDepartures = async () => {
        setIsLoading(true);
        try {
            const response = await departureService.getAll();
            if (isApiError(response)) {
                setError(response.statusText || "Error al cargar partidas");
            } else {
                setDepartures(response || []);
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
        fetchDepartures();
    }, []);

    return {
        departures,
        isLoading,
        error,
        fetchDepartures
    };
};

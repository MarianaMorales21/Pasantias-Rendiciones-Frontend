import { useState, useEffect } from "react";
import { ranksService } from "../services/ranksService";
import { RankItem } from "../types/ranks";
import { isApiError } from "../helpers/helpHttp";

export const useRanks = () => {
    const [ranks, setRanks] = useState<RankItem[]>([]);
    const [isLoadingRanks, setIsLoadingRanks] = useState(false);
    const [errorRanks, setErrorRanks] = useState<string | null>(null);

    const fetchRanks = async () => {
        setIsLoadingRanks(true);
        try {
            const response = await ranksService.getAll();
            if (isApiError(response)) {
                setErrorRanks(response.statusText || "Error al cargar profesiones (rangos)");
            } else {
                setRanks(response || []);
                setErrorRanks(null);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de conexión";
            setErrorRanks(message);
        } finally {
            setIsLoadingRanks(false);
        }
    };

    useEffect(() => {
        fetchRanks();
    }, []);

    return {
        ranks,
        isLoadingRanks,
        errorRanks,
        fetchRanks
    };
};

import { useState, useEffect } from "react";
import { orderService } from "../services/orderService";
import { OrderItem } from "../types/orders";
import { isApiError } from "../helpers/helpHttp";

export const useOrders = () => {
    const [data, setData] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await orderService.getAll();
            if (isApiError(response)) {
                setError(response.statusText || "Error al cargar órdenes");
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

    const handleCreate = async (formData: Partial<OrderItem>) => {
        setIsLoading(true);
        try {
            const response = await orderService.create(formData);
            if (isApiError(response)) {
                alert("Error al crear orden: " + (response.statusText || "Error desconocido"));
                return null;
            }
            await fetchData();
            return response;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de red";
            alert("Error al crear orden: " + message);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id: number, formData: Partial<OrderItem>) => {
        setIsLoading(true);
        try {
            const response = await orderService.update(id, formData);
            if (isApiError(response)) {
                alert("Error al actualizar orden: " + (response.statusText || "Error desconocido"));
                return false;
            }
            await fetchData();
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de red";
            alert("Error al actualizar orden: " + message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await orderService.delete(id);
            if (isApiError(response)) {
                alert("Error al eliminar orden: " + (response.statusText || "Error desconocido"));
                return false;
            }
            await fetchData();
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de red";
            alert("Error al eliminar orden: " + message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        isLoading,
        error,
        fetchData,
        handleCreate,
        handleUpdate,
        handleDelete
    };
};

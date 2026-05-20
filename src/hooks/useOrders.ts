import { useState, useEffect } from "react";
import { orderService } from "../services/orderService";
import { OrderItem } from "../types/orders";
import { isApiError, ApiError } from "../helpers/helpHttp";

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
        if (!formData.num_opg || !formData.ced_opg || !formData.fec_opg || !formData.fdc_opg || !formData.dcr_opg || !formData.mon_opg || !formData.con_opg || !formData.par_opg) {
            alert("Por favor, llene todos los campos requeridos.");
            return null;
        }
        // Validar monto mayor a 0
        if (Number(formData.mon_opg) <= 0) {
            alert("El monto de la Orden de Pago debe ser mayor a cero.");
            return null;
        }
        // Validar fecha decreto no mayor a fecha orden
        if (formData.fdc_opg && formData.fec_opg && new Date(formData.fdc_opg) > new Date(formData.fec_opg)) {
            alert("La fecha del decreto no puede ser posterior a la fecha de la Orden de Pago.");
            return null;
        }
        setIsLoading(true);
        try {
            const response = await orderService.create(formData);
            if (isApiError(response)) {
                const msg = (response as ApiError).message || response.statusText || "Error desconocido";
                alert("Error al crear orden: " + msg);
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
        if (!formData.num_opg || !formData.ced_opg || !formData.fec_opg || !formData.fdc_opg || !formData.dcr_opg || !formData.mon_opg || !formData.con_opg || !formData.par_opg) {
            alert("Por favor, llene todos los campos requeridos.");
            return false;
        }
        // Validar monto mayor a 0
        if (Number(formData.mon_opg) <= 0) {
            alert("El monto de la Orden de Pago debe ser mayor a cero.");
            return false;
        }
        // Validar fecha decreto no mayor a fecha orden
        if (formData.fdc_opg && formData.fec_opg && new Date(formData.fdc_opg) > new Date(formData.fec_opg)) {
            alert("La fecha del decreto no puede ser posterior a la fecha de la Orden de Pago.");
            return false;
        }
        setIsLoading(true);
        try {
            const response = await orderService.update(id, formData);
            if (isApiError(response)) {
                const msg = (response as ApiError).message || response.statusText || "Error desconocido";
                alert("Error al actualizar orden: " + msg);
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
                const msg = (response as ApiError).message || response.statusText || "Error desconocido";
                return { success: false, error: msg };
            }
            await fetchData();
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de red";
            return { success: false, error: message };
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

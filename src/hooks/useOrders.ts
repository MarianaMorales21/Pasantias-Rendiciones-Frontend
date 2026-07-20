import { useState, useEffect } from "react";
import { orderService } from "../services/orderService";
import { OrderItem } from "../types/orders";
import { isApiError, ApiError } from "../helpers/helpHttp";

export const useOrders = () => {
    const [data, setData] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
    // Warning modal states to replace alerts
    const [warningMessage, setWarningMessage] = useState("");
    const [isWarningOpen, setIsWarningOpen] = useState(false);

    const clearFieldErrors = () => setFieldErrors({});

    const validateOrderFields = (formData: Partial<OrderItem>): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.num_opg) errors.num_opg = "Este campo es requerido";
        if (!formData.ctd_opg) errors.ctd_opg = "Este campo es requerido";
        if (!formData.fec_opg) errors.fec_opg = "Este campo es requerido";
        if (!formData.fdc_opg) errors.fdc_opg = "Este campo es requerido";
        if (!formData.dcr_opg) errors.dcr_opg = "Este campo es requerido";
        if (!formData.mon_opg) errors.mon_opg = "Este campo es requerido";
        if (!formData.con_opg) errors.con_opg = "Este campo es requerido";
        if (!formData.par_opg) errors.par_opg = "Este campo es requerido";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

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
        if (!validateOrderFields(formData)) return null;
        if (Number(formData.mon_opg) <= 0) {
            setWarningMessage("El monto de la Orden de Pago debe ser mayor a cero.");
            setIsWarningOpen(true);
            return null;
        }
        if (formData.fec_opg && formData.fec_opg > new Date().toISOString().split('T')[0]) {
            setWarningMessage("La fecha de emisión no puede ser posterior a la fecha actual.");
            setIsWarningOpen(true);
            return null;
        }
        if (formData.fco_opg && formData.fco_opg > new Date().toISOString().split('T')[0]) {
            setWarningMessage("La fecha de cobro no puede ser posterior a la fecha actual.");
            setIsWarningOpen(true);
            return null;
        }
        if (formData.fco_opg && formData.fec_opg && formData.fco_opg < formData.fec_opg) {
            setWarningMessage("La fecha de cobro no puede ser anterior a la fecha de emisión.");
            setIsWarningOpen(true);
            return null;
        }
        if (formData.fdc_opg && formData.fec_opg && formData.fdc_opg > formData.fec_opg) {
            setWarningMessage("La fecha del decreto no puede ser posterior a la fecha de emisión.");
            setIsWarningOpen(true);
            return null;
        }
        setIsLoading(true);
        try {
            const response = await orderService.create(formData);
            if (isApiError(response)) {
                const msg = (response as ApiError).message || response.statusText || "Error desconocido";
                setWarningMessage("Error al crear orden: " + msg);
                setIsWarningOpen(true);
                return null;
            }
            await fetchData();
            clearFieldErrors();
            return response;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de red";
            setWarningMessage("Error al crear orden: " + message);
            setIsWarningOpen(true);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id: number, formData: Partial<OrderItem>) => {
        if (!validateOrderFields(formData)) return false;
        if (Number(formData.mon_opg) <= 0) {
            setWarningMessage("El monto de la Orden de Pago debe ser mayor a cero.");
            setIsWarningOpen(true);
            return false;
        }
        if (formData.fec_opg && formData.fec_opg > new Date().toISOString().split('T')[0]) {
            setWarningMessage("La fecha de emisión no puede ser posterior a la fecha actual.");
            setIsWarningOpen(true);
            return false;
        }
        if (formData.fco_opg && formData.fco_opg > new Date().toISOString().split('T')[0]) {
            setWarningMessage("La fecha de cobro no puede ser posterior a la fecha actual.");
            setIsWarningOpen(true);
            return false;
        }
        if (formData.fco_opg && formData.fec_opg && formData.fco_opg < formData.fec_opg) {
            setWarningMessage("La fecha de cobro no puede ser anterior a la fecha de emisión.");
            setIsWarningOpen(true);
            return false;
        }
        if (formData.fdc_opg && formData.fec_opg && formData.fdc_opg > formData.fec_opg) {
            setWarningMessage("La fecha del decreto no puede ser posterior a la fecha de emisión.");
            setIsWarningOpen(true);
            return false;
        }
        setIsLoading(true);
        try {
            const response = await orderService.update(id, formData);
            if (isApiError(response)) {
                const msg = (response as ApiError).message || response.statusText || "Error desconocido";
                setWarningMessage("Error al actualizar orden: " + msg);
                setIsWarningOpen(true);
                return false;
            }
            await fetchData();
            clearFieldErrors();
            return true;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error de red";
            setWarningMessage("Error al actualizar orden: " + message);
            setIsWarningOpen(true);
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
        fieldErrors,
        clearFieldErrors,
        fetchData,
        handleCreate,
        handleUpdate,
        handleDelete,
        warningMessage,
        isWarningOpen,
        setIsWarningOpen
    };
};

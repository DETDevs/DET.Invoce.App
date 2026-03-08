import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigationBlocker } from "@/shared/context/NavigationBlockerContext";
import { useCart } from "./useCart";
import orderApi from "@/api/order/OrderAPI";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export const useOrderLogic = (isAddingToExisting = false) => {
    const navigate = useNavigate();
    const { setBlocker } = useNavigationBlocker();
    const { cart, addToCart, updateQuantity, removeFromCart, total, clearCart, initializeCart } =
        useCart();
    const { user } = useAuthStore();
    const [orderId, setOrderId] = useState<number | null>(null);
    const [orderNumber, setOrderNumber] = useState(0);
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const [isManualCancelOpen, setIsManualCancelOpen] = useState(false);
    const [pendingPath, setPendingPath] = useState<string | null>(null);
    const [dialogConfig, setDialogConfig] = useState({
        title: "Cancelar Orden",
        message:
            "¿Estás seguro de que deseas cancelar esta orden? Se perderán todos los productos agregados.",
        confirmText: "Sí, cancelar",
        cancelText: "Volver",
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    const orderIdRef = useRef<number | null>(null);
    const wasCheckedOut = useRef(false);
    const hasCreatedOrder = useRef(false);

    useEffect(() => {
        orderIdRef.current = orderId;
    }, [orderId]);

    const cancelCurrentOrder = useCallback(async () => {
        const id = orderIdRef.current;
        if (id) {
            try {
                await orderApi.cancel(id, user?.name || "Caja");
            } catch (err) {
                console.error("[Order] Error al cancelar orden:", err);
            }
            orderIdRef.current = null;
            setOrderId(null);
        }
    }, [user]);

    useEffect(() => {
        if (isAddingToExisting) return;
        if (hasCreatedOrder.current) return;
        hasCreatedOrder.current = true;

        setIsCreatingOrder(true);
        orderApi.create({ createdBy: user?.name || "Caja" })
            .then((res: any) => {
                const id = res?.orderId ?? res;
                setOrderId(id);
                setOrderNumber(id);
            })
            .catch((err: unknown) => {
                console.error("[Order] Error al crear:", err);
                toast.error("No se pudo iniciar la sesión de orden. Verifique la conexión e intente de nuevo.");
            })
            .finally(() => setIsCreatingOrder(false));
    }, []);

    useEffect(() => {
        if (isAddingToExisting) return;
        return () => {
            if (!wasCheckedOut.current && orderIdRef.current) {
                const id = orderIdRef.current;
                const name = user?.name || "Caja";
                orderApi.cancel(id, name).catch(() => { });
            }
        };
    }, [isAddingToExisting, user]);

    useEffect(() => {
        if (isAddingToExisting) return;
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (cart.length > 0) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [cart.length, isAddingToExisting]);

    useEffect(() => {
        if (isAddingToExisting) {
            setBlocker(null);
            return;
        }
        const blocker = (path: string) => {
            setPendingPath(path);
            if (cart.length === 0) {
                setDialogConfig({
                    title: "Salir de la orden",
                    message: `Si sales ahora, perderás el número de orden generado (#${orderNumber}). ¿Deseas continuar?`,
                    confirmText: "Sí, salir",
                    cancelText: "Cancelar",
                });
            } else {
                setDialogConfig({
                    title: "Cancelar Orden",
                    message:
                        "¿Estás seguro de que deseas cancelar esta orden? Se perderán todos los productos agregados.",
                    confirmText: "Sí, cancelar",
                    cancelText: "Volver",
                });
            }
            setIsManualCancelOpen(true);
        };
        setBlocker(blocker);
        return () => setBlocker(null);
    }, [cart.length, orderNumber, setBlocker, isAddingToExisting]);

    const handleCheckout = () => {
        wasCheckedOut.current = true;
        orderIdRef.current = null;
        setOrderId(null);
        clearCart();
        setIsCartOpen(false);
        setBlocker(null);
        navigate('/takeout');
    };

    const handleRequestCancel = () => {
        setPendingPath(null);
        setIsCartOpen(false);
        setDialogConfig({
            title: "Cancelar Orden",
            message:
                cart.length === 0
                    ? "¿Deseas cancelar esta orden y salir?"
                    : "¿Estás seguro de que deseas cancelar esta orden? Se perderán todos los productos agregados.",
            confirmText: "Sí, cancelar",
            cancelText: "Volver",
        });
        setIsManualCancelOpen(true);
    };

    const handleConfirmDialog = async () => {
        setIsManualCancelOpen(false);
        await cancelCurrentOrder();
        setBlocker(null);
        if (pendingPath) {
            navigate(pendingPath);
        } else {
            navigate('/takeout');
            toast.error("Orden cancelada");
        }
        setPendingPath(null);
    };

    const handleCloseDialog = () => {
        setIsManualCancelOpen(false);
        setPendingPath(null);
    };

    return {
        cart, total, orderNumber, orderId, isCreatingOrder, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeFromCart, initializeCart,
        handleCheckout, handleRequestCancel, isDialogOpen: isManualCancelOpen,
        dialogTitle: dialogConfig.title, dialogMessage: dialogConfig.message,
        confirmText: dialogConfig.confirmText, cancelText: dialogConfig.cancelText,
        handleConfirmDialog, handleCloseDialog,
    };
};

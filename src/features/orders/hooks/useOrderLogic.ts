import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigationBlocker } from "@/shared/context/NavigationBlockerContext";
import { useCart } from "./useCart";

export const useOrderLogic = () => {
    const navigate = useNavigate();
    const { setBlocker } = useNavigationBlocker();
    const { cart, addToCart, updateQuantity, removeFromCart, total, clearCart, initializeCart } =
        useCart();
    const [orderNumber, setOrderNumber] = useState(
        Math.floor(Math.random() * 9000) + 1000,
    );
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

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (cart.length > 0) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [cart.length]);

    useEffect(() => {
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
    }, [cart.length, orderNumber, setBlocker]);

    const refreshOrder = useCallback(() => {
        clearCart();
        setOrderNumber(Math.floor(Math.random() * 9000) + 1000);
    }, [clearCart]);

    const handleCheckout = () => {
        if (cart.length > 0) {
            const invoice = {
                id: `FAC-VD-${orderNumber}`,
                orderNumber: `VD-${orderNumber}`,
                items: cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    subtotal: item.price * item.quantity
                })),
                subtotal: total,
                tax: 0,
                total: total,
                status: 'completed' as const,
                createdAt: new Date().toISOString(),
                createdBy: 'Usuario Actual'
            };

            try {
                const stored = localStorage.getItem('invoices');
                const invoices = stored ? JSON.parse(stored) : [];
                invoices.unshift(invoice);
                localStorage.setItem('invoices', JSON.stringify(invoices));
            } catch (error) {
                console.error('Error al guardar factura:', error);
            }

            toast.success("Orden Tomada correctamente");
            refreshOrder();
            setIsCartOpen(false);
        }
    };

    const handleRequestCancel = () => {
        setPendingPath(null);
        if (cart.length === 0) {
            setIsCartOpen(false);
        } else {
            setIsCartOpen(false);
            setDialogConfig({
                title: "Cancelar Orden",
                message:
                    "¿Estás seguro de que deseas cancelar esta orden? Se perderán todos los productos agregados.",
                confirmText: "Sí, cancelar",
                cancelText: "Volver",
            });
            setIsManualCancelOpen(true);
        }
    };

    const handleConfirmDialog = () => {
        setIsManualCancelOpen(false);
        if (pendingPath) {
            setBlocker(null)
            navigate(pendingPath);
        } else {
            refreshOrder();
            setIsCartOpen(false);
            toast.error("Orden cancelada");
        }
        setPendingPath(null);
    };

    const handleCloseDialog = () => {
        setIsManualCancelOpen(false);
        setPendingPath(null);
    };

    return {
        cart, total, orderNumber, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeFromCart, initializeCart,
        handleCheckout, handleRequestCancel, isDialogOpen: isManualCancelOpen,
        dialogTitle: dialogConfig.title, dialogMessage: dialogConfig.message,
        confirmText: dialogConfig.confirmText, cancelText: dialogConfig.cancelText,
        handleConfirmDialog, handleCloseDialog,
    };
};
import { useState, useEffect } from "react";
import { logError, logStep } from "@/shared/utils/logError";
import { useNavigate } from "react-router-dom";
import type { TakeoutOrder } from "@/shared/types";
import { useTakeoutStore } from "@/features/takeout/store/useTakeoutStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { handleInvoiceFlow } from "@/services/invoiceService";
import orderApi from "@/api/order/OrderAPI";
import toast from "react-hot-toast";

interface UseTakeoutDetailProps {
    isOpen: boolean;
    onClose: () => void;
    tableNumber: number | null;
    cuentas: TakeoutOrder[];
}

export const useTakeoutDetail = ({
    isOpen,
    onClose,
    tableNumber,
    cuentas,
}: UseTakeoutDetailProps) => {
    const [selectedCuentaId, setSelectedCuentaId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta">(
        "efectivo",
    );
    const [amountPaid, setAmountPaid] = useState("");
    const [paidInCordobas, setPaidInCordobas] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSplitMode, setIsSplitMode] = useState(false);
    const [splitQuantities, setSplitQuantities] = useState<Map<number, number>>(
        new Map(),
    );
    const [splitCustomerName, setSplitCustomerName] = useState("");
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const navigate = useNavigate();
    const { completeOrder, completeOrdersByBackendId, splitOrder, updateItemQuantity, removeItem } = useTakeoutStore();
    const { user } = useAuthStore();
    const canInvoice = user?.role === "cajero" || user?.role === "admin";

    useEffect(() => {
        if (isOpen && cuentas.length > 0) {
            setSelectedCuentaId(cuentas[0].id);
        }
        if (!isOpen) {
            setSelectedCuentaId(null);
            setIsSplitMode(false);
            setSplitQuantities(new Map());
            setShowCancelConfirm(false);
            setIsCancelling(false);
            setIsEditMode(false);
        }
        setAmountPaid("");
        setPaymentMethod("efectivo");
        setIsProcessing(false);
    }, [isOpen, tableNumber]);

    useEffect(() => {
        if (cuentas.length === 0) return;
        const stillExists = cuentas.some((c) => c.id === selectedCuentaId);
        if (!stillExists) {
            setSelectedCuentaId(cuentas[0].id);
        }
    }, [cuentas, selectedCuentaId]);

    useEffect(() => {
        setAmountPaid("");
        setPaymentMethod("efectivo");
        setIsProcessing(false);
        setIsSplitMode(false);
        setSplitQuantities(new Map());
    }, [selectedCuentaId]);

    const isParaLlevar = tableNumber === 0;
    const selectedCuenta =
        cuentas.find((c) => c.id === selectedCuentaId) || cuentas[0];

    const subtotal = selectedCuenta
        ? selectedCuenta.items.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0,
        )
        : 0;
    const total = subtotal;
    const isPaymentSufficient =
        paymentMethod === "tarjeta" ||
        (paymentMethod === "efectivo" && paidInCordobas >= total);

    const handleInvoice = async () => {
        if (!isPaymentSufficient) {
            toast.error("El monto recibido es insuficiente");
            return;
        }

        if (!selectedCuenta?.backendOrderId) {
            toast.error(
                "Ocurrió un problema al cargar esta orden. Intente cerrar y abrir la mesa de nuevo, o contacte a soporte.",
                { duration: 5000 },
            );
            return;
        }

        setIsProcessing(true);

        try {
            logStep("handleInvoice", "Obteniendo cuentas de la orden", {
                backendOrderId: selectedCuenta.backendOrderId,
                cuentaId: selectedCuenta.id,
                tableNumber, total, paymentMethod,
            });

            const accountsData = await orderApi.getOrderAccountWithDetails(
                selectedCuenta.backendOrderId,
            );
            const accountsList = Array.isArray(accountsData)
                ? accountsData
                : [accountsData];

            const openAccounts = accountsList.filter((a: any) => a.status === "Open");
            const account =
                openAccounts.find(
                    (a: any) => a.accountNumber === selectedCuenta.cuentaNumber,
                ) || openAccounts[0];

            if (!account?.orderAccountId) {
                toast.error(
                    "No hay cuentas abiertas para facturar. La orden puede ya estar cerrada.",
                    { duration: 5000 },
                );
                return;
            }

            const orderAccountId: number = account.orderAccountId;
            const pm = paymentMethod === "tarjeta" ? "CARD" : "CASH";

            logStep("handleInvoice", "Facturando cuenta", {
                orderAccountId, paymentMethod: pm, total,
            });

            await handleInvoiceFlow({ orderAccountId, paymentmethod: pm });

            logStep("handleInvoice", "Factura generada exitosamente", {
                backendOrderId: selectedCuenta.backendOrderId, paymentMethod,
            });

            completeOrder(selectedCuenta.id);
            if (selectedCuenta.backendOrderId) {
                completeOrdersByBackendId(selectedCuenta.backendOrderId);
                localStorage.removeItem(`order-customer-name-${selectedCuenta.backendOrderId}`);
            }

            if (paymentMethod === "efectivo" && paidInCordobas > total) {
                const changeAmount = paidInCordobas - total;
                toast.success(
                    `Factura generada. Cambio: C$ ${changeAmount.toFixed(2)}`,
                    { icon: "🧾", duration: 5000 },
                );
            } else {
                toast.success("Factura generada correctamente", { icon: "🧾" });
            }

            onClose();
        } catch (error) {
            logError("[TakeoutDetailModal] Error al facturar", error, { action: "invoice" });
            toast.error(
                "No se pudo generar la factura. Verifique la conexión e intente de nuevo. Si el problema persiste, llame a soporte.",
                { duration: 6000 },
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleSplitItem = (idx: number) => {
        setSplitQuantities((prev) => {
            const next = new Map(prev);
            if (next.has(idx)) {
                next.delete(idx);
            } else {
                next.set(idx, selectedCuenta.items[idx].quantity);
            }
            return next;
        });
    };

    const setSplitQty = (idx: number, qty: number) => {
        setSplitQuantities((prev) => {
            const next = new Map(prev);
            const maxQty = selectedCuenta.items[idx].quantity;
            if (qty <= 0) {
                next.delete(idx);
            } else {
                next.set(idx, Math.min(qty, maxQty));
            }
            return next;
        });
    };

    const handleCancelCuenta = async () => {
        if (!selectedCuenta?.backendOrderId) {
            toast.error("No se pudo obtener la información de la cuenta.", {
                duration: 5000,
            });
            return;
        }
        const originalCuenta = cuentas[0];
        setIsProcessing(true);
        try {
            const accountsData = await orderApi.getOrderAccountWithDetails(
                selectedCuenta.backendOrderId,
            );
            const accountsList = Array.isArray(accountsData)
                ? accountsData
                : [accountsData];
            const fromAccount =
                accountsList.find(
                    (a: any) => a.accountNumber === selectedCuenta.cuentaNumber,
                ) ||
                accountsList.find(
                    (a: any) => a.accountNumber !== originalCuenta.cuentaNumber,
                );
            const toAccount =
                accountsList.find(
                    (a: any) => a.accountNumber === originalCuenta.cuentaNumber,
                ) || accountsList[0];
            if (!fromAccount?.orderAccountId || !toAccount?.orderAccountId) {
                toast.error("No se pudo identificar las cuentas. Intente de nuevo.", {
                    duration: 5000,
                });
                return;
            }
            await orderApi.accountMerge(
                fromAccount.orderAccountId,
                toAccount.orderAccountId,
                user?.name || "Cajero",
            );
            // Clean up split account name from localStorage
            if (selectedCuenta.backendOrderId) {
                localStorage.removeItem(
                    `order-customer-name-${selectedCuenta.backendOrderId}-account-${selectedCuenta.cuentaNumber}`,
                );
            }
            toast.success(
                "Cuenta cancelada. Los productos regresaron a la cuenta original.",
                { icon: "↩️" },
            );
            onClose();
        } catch (error) {
            logError("[TakeoutDetailModal] Error al cancelar cuenta", error, { action: "cancelCuenta" });
            toast.error(
                "No se pudo cancelar la cuenta. Verifique la conexión e intente de nuevo.",
                { duration: 5000 },
            );
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmSplit = async () => {
        if (splitQuantities.size === 0) return;
        const originalCuenta = cuentas[0];
        const totalItemsInOrder = originalCuenta.items.length;
        const allMovedCompletely =
            splitQuantities.size === totalItemsInOrder &&
            Array.from(splitQuantities.entries()).every(
                ([idx, qty]) => qty >= originalCuenta.items[idx].quantity,
            );
        if (allMovedCompletely) {
            toast.error("No puedes mover todos los productos. Deja al menos uno.");
            return;
        }

        if (!originalCuenta.backendOrderId) {
            toast.error(
                "Ocurrió un problema al cargar esta orden. Intente cerrar y abrir la mesa de nuevo, o contacte a soporte.",
                { duration: 5000 },
            );
            return;
        }

        try {
            const accounts = await orderApi.getOrderAccountWithDetails(
                originalCuenta.backendOrderId,
            );
            const accountsList = Array.isArray(accounts) ? accounts : [accounts];
            const account =
                accountsList.find(
                    (a: any) =>
                        a.accountNumber === 1 ||
                        a.accountNumber === originalCuenta.cuentaNumber,
                ) || accountsList[0];

            if (!account?.orderAccountId) {
                toast.error(
                    "No se pudo obtener la información de la cuenta. Intente de nuevo o contacte a soporte.",
                    { duration: 5000 },
                );
                return;
            }

            const backendDetails: {
                orderDetailId: number;
                productCode: string;
                quantity: number;
            }[] = account.orderAccountDetails || [];

            const splitPayload: { orderDetailId: number; quantity: number }[] = [];

            for (const [idx, qty] of splitQuantities.entries()) {
                const localItem = originalCuenta.items[idx];
                const backendDetail = backendDetails.find(
                    (d: any) => d.productCode === localItem.productCode,
                );
                if (backendDetail) {
                    splitPayload.push({
                        orderDetailId: backendDetail.orderDetailId,
                        quantity: qty,
                    });
                }
            }

            if (splitPayload.length === 0) {
                toast.error(
                    "No se pudo dividir la cuenta correctamente. Intente de nuevo o contacte a soporte.",
                    { duration: 5000 },
                );
                return;
            }

            await orderApi.accountSplit({
                fromAccountId: account.orderAccountId,
                creteBy: user?.name || "Cajero",
                orderAccountSplitTypes: splitPayload,
            });

            const splitItems = Array.from(splitQuantities.entries()).map(
                ([index, quantity]) => ({ index, quantity }),
            );
            splitOrder(originalCuenta.id, splitItems, splitCustomerName.trim() || undefined);

            // Persist split account name to localStorage keyed by orderId + new accountNumber
            if (originalCuenta.backendOrderId && splitCustomerName.trim()) {
                const newAccountNumber = cuentas.length + 1;
                localStorage.setItem(
                    `order-customer-name-${originalCuenta.backendOrderId}-account-${newAccountNumber}`,
                    splitCustomerName.trim(),
                );
            }
            const totalMoved = splitItems.reduce((acc, s) => acc + s.quantity, 0);
            toast.success(
                `Cuenta dividida: ${totalMoved} unidad${totalMoved > 1 ? "es" : ""} movida${totalMoved > 1 ? "s" : ""} a nueva cuenta`,
                { icon: "✂️" },
            );
            onClose();
        } catch (error) {
            logError("[TakeoutDetailModal] Error al dividir cuenta", error, { action: "splitAccount" });
            toast.error(
                "No se pudo dividir la cuenta. Verifique la conexión e intente de nuevo.",
                { duration: 5000 },
            );
        }

        setIsSplitMode(false);
        setSplitQuantities(new Map());
        setSplitCustomerName("");
    };

    const handleCancelOrder = async () => {
        const mainCuenta = cuentas[0];
        if (!mainCuenta.backendOrderId) {
            toast.error("No se pudo obtener la información de la orden.", {
                duration: 5000,
            });
            return;
        }

        setIsCancelling(true);
        try {
            await orderApi.cancel(mainCuenta.backendOrderId, user?.name || "Sistema");
            cuentas.forEach((cuenta) => {
                completeOrder(cuenta.id);
                if (cuenta.backendOrderId) {
                    completeOrdersByBackendId(cuenta.backendOrderId);
                }
            });
            // Clean all localStorage keys for this order
            const orderId = mainCuenta.backendOrderId;
            localStorage.removeItem(`order-customer-name-${orderId}`);
            for (let i = 2; i <= cuentas.length + 2; i++) {
                localStorage.removeItem(`order-customer-name-${orderId}-account-${i}`);
            }
            toast.success("Orden cancelada correctamente", { icon: "🚫" });
            onClose();
        } catch (error) {
            logError("[TakeoutDetailModal] Error al cancelar orden", error, { action: "cancelOrder" });
            toast.error(
                "No se pudo cancelar la orden. Verifique la conexión e intente de nuevo.",
                { duration: 5000 },
            );
        } finally {
            setIsCancelling(false);
            setShowCancelConfirm(false);
        }
    };

    const splitSubtotal = Array.from(splitQuantities.entries()).reduce(
        (acc, [idx, qty]) => {
            const item = selectedCuenta?.items[idx];
            return item ? acc + item.price * qty : acc;
        },
        0,
    );

    const splitItemCount = splitQuantities.size;

    const createdTime = selectedCuenta
        ? new Date(selectedCuenta.createdAt).toLocaleTimeString("es-NI", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Managua",
        })
        : "";

    const handleAddProducts = () => {
        onClose();
        navigate("/ordenes", {
            state: {
                addToTable: tableNumber,
                addToCuentaId: selectedCuenta?.id,
                cuentaNumber: selectedCuenta?.cuentaNumber,
            },
        });
    };

    const handleEditQuantity = async (_itemIndex: number, _newQuantity: number) => { };
    const handleRemoveItem = async (_itemIndex: number) => { };

    // ── Edit mode: local pending state (like split mode) ──
    const [editQuantities, setEditQuantities] = useState<Map<number, number>>(new Map());
    const [removedItems, setRemovedItems] = useState<Set<number>>(new Set());

    const enterEditMode = () => {
        setEditQuantities(new Map());
        setRemovedItems(new Set());
        setIsEditMode(true);
    };

    const exitEditMode = () => {
        setEditQuantities(new Map());
        setRemovedItems(new Set());
        setIsEditMode(false);
    };

    const setEditQty = (idx: number, qty: number) => {
        if (removedItems.has(idx)) return;
        setEditQuantities((prev) => {
            const next = new Map(prev);
            const originalQty = selectedCuenta?.items[idx]?.quantity ?? 1;
            if (qty <= 0) {
                next.delete(idx);
                setRemovedItems((p) => new Set(p).add(idx));
            } else if (qty === originalQty) {
                next.delete(idx);
            } else {
                next.set(idx, qty);
            }
            return next;
        });
    };

    const toggleRemoveItem = (idx: number) => {
        setRemovedItems((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) {
                next.delete(idx);
            } else {
                next.add(idx);
                setEditQuantities((p) => { const n = new Map(p); n.delete(idx); return n; });
            }
            return next;
        });
    };

    const editHasChanges = editQuantities.size > 0 || removedItems.size > 0;
    const remainingAfterEdit = selectedCuenta ? selectedCuenta.items.length - removedItems.size : 0;

    const handleConfirmEdit = async () => {
        if (!selectedCuenta?.backendOrderId) {
            toast.error('No se pudo obtener la información de la orden.');
            return;
        }
        if (remainingAfterEdit <= 0) {
            toast.error('No puedes eliminar todos los productos. Cancela la orden.');
            return;
        }
        setIsProcessing(true);
        try {
            const accountsData = await orderApi.getOrderAccountWithDetails(selectedCuenta.backendOrderId);
            const accountsList = Array.isArray(accountsData) ? accountsData : [accountsData];
            const account = accountsList.find((a: any) => a.accountNumber === selectedCuenta.cuentaNumber) || accountsList[0];
            if (!account?.orderAccountId) { toast.error('No se encontró la cuenta.'); return; }

            const backendDetails: any[] = account.orderAccountDetails || [];
            const removedCodes = new Set(Array.from(removedItems).map((idx) => selectedCuenta.items[idx]?.productCode));

            const updatedDetails = backendDetails
                .filter((d: any) => !removedCodes.has(d.productCode))
                .map((d: any) => {
                    const localIdx = selectedCuenta.items.findIndex((i) => i.productCode === d.productCode);
                    const pendingQty = localIdx >= 0 ? editQuantities.get(localIdx) : undefined;
                    return { productCode: d.productCode, quantity: pendingQty ?? d.quantity, unitPrice: d.unitPrice, discount: d.discount || 0, notes: d.notes || '' };
                });

            await orderApi.save({
                orderId: selectedCuenta.backendOrderId,
                createdBy: user?.name || 'Sistema',
                orderType: !isParaLlevar,
                tableId: isParaLlevar ? undefined : tableNumber ?? undefined,
                details: updatedDetails,
            });
            // Save pending changes before clearing state
            const pendingQuantities = new Map(editQuantities);
            const pendingRemovals = new Set(removedItems);
            const orderId = selectedCuenta.id;

            // First apply quantity changes
            for (const [idx, qty] of pendingQuantities.entries()) {
                if (!pendingRemovals.has(idx)) updateItemQuantity(orderId, idx, qty);
            }
            // Then apply removals in reverse order to keep indices stable
            const sortedRemovals = Array.from(pendingRemovals).sort((a, b) => b - a);
            for (const idx of sortedRemovals) removeItem(orderId, idx);

            toast.success('Orden actualizada correctamente');
            exitEditMode();
            onClose();
        } catch (error) {
            logError("[TakeoutDetail] Error al confirmar edición", error, { action: "confirmEdit" });
            toast.error('No se pudo actualizar la orden.');
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        selectedCuentaId, setSelectedCuentaId, selectedCuenta,
        paymentMethod, setPaymentMethod, amountPaid, setAmountPaid,
        paidInCordobas, setPaidInCordobas, isProcessing, isParaLlevar,
        canInvoice, subtotal, total, isPaymentSufficient,
        isSplitMode, setIsSplitMode, splitQuantities, setSplitQuantities,
        splitCustomerName, setSplitCustomerName,
        splitSubtotal, splitItemCount, showCancelConfirm, setShowCancelConfirm,
        isCancelling, createdTime, handleInvoice, toggleSplitItem, setSplitQty,
        handleCancelCuenta, handleConfirmSplit, handleCancelOrder, handleAddProducts,
        isEditMode, enterEditMode, exitEditMode,
        editQuantities, removedItems, setEditQty, toggleRemoveItem,
        editHasChanges, remainingAfterEdit, handleConfirmEdit,
        handleEditQuantity, handleRemoveItem,
    };
};


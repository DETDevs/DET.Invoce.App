import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { CartItem } from "@/features/orders/types/index";
import type { TakeoutItem } from "@/shared/types";
import { useTakeoutStore } from "@/features/takeout/store/useTakeoutStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import orderApi from "@/api/order/OrderAPI";
import restaurantTableApi from "@/api/restaurant-table/RestaurantTableAPI";
import { handleInvoiceFlow } from "@/services/invoiceService";
import toast from "react-hot-toast";

type RestaurantTable = {
    tableId: number;
    tableNumber: number;
    isOccupied: boolean;
    isActive: boolean;
};

type OrderMode = "mesa" | "llevar";

const PARA_LLEVAR_TABLE = 0;

interface UseCartActionsProps {
    cart: CartItem[];
    orderId: number | null;
    onOrderSent: () => void;
    preselectedTable?: number;
    preselectedCuentaId?: string;
    preselectedCuentaNumber?: number;
}

export const useCartActions = ({
    cart,
    orderId,
    onOrderSent,
    preselectedTable,
    preselectedCuentaId,
    preselectedCuentaNumber,
}: UseCartActionsProps) => {
    const isPreselected =
        preselectedTable !== undefined && preselectedTable !== null;
    const [mode, setMode] = useState<OrderMode>("mesa");
    const [selectedTable, setSelectedTable] = useState<number | null>(
        isPreselected ? preselectedTable : null,
    );
    const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<"new" | "add-to-cuenta">(
        isPreselected ? "add-to-cuenta" : "new",
    );
    const [selectedCuentaId, setSelectedCuentaId] = useState<string | null>(
        isPreselected && preselectedCuentaId ? preselectedCuentaId : null,
    );

    const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta">(
        "efectivo",
    );
    const [amountPaid, setAmountPaid] = useState("");
    const [paidInCordobas, setPaidInCordobas] = useState(0);
    const [apiTables, setApiTables] = useState<RestaurantTable[]>([]);

    const { user } = useAuthStore();
    const isCajero = user?.role === "cajero" || user?.role === "admin";
    const userName = user?.name || "Mesero";

    const {
        addOrder,
        addItemsToOrder,
        getActiveOrdersByTable,
        getNextCuentaNumber,
    } = useTakeoutStore();

    const navigate = useNavigate();

    const activeCuentas = selectedTable
        ? getActiveOrdersByTable(selectedTable)
        : [];

    useEffect(() => {
        if (isPreselected) return;
        if (selectedTable && activeCuentas.length > 0) {
            setSelectedAction("add-to-cuenta");
            setSelectedCuentaId(activeCuentas[0].id);
        } else {
            setSelectedAction("new");
            setSelectedCuentaId(null);
        }
    }, [selectedTable]);

    useEffect(() => {
        restaurantTableApi
            .get()
            .then((data: RestaurantTable[]) => {
                setApiTables(data.filter((t) => t.isActive));
            })
            .catch((err: unknown) => {
                console.error("[TakeoutCartPanel] Error fetching tables:", err);
            });
    }, []);

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
    );
    const total = subtotal;
    const isPaymentSufficient =
        paymentMethod === "tarjeta" ||
        (paymentMethod === "efectivo" && paidInCordobas >= total);

    const handleSendOrder = async () => {
        if (cart.length === 0) {
            toast.error("Agrega al menos un producto");
            return;
        }

        const items: TakeoutItem[] = cart.map((item) => ({
            productId: item.id,
            productCode: item.code,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            addedAt: new Date().toISOString(),
        }));

        try {
            if (isPreselected && preselectedCuentaId) {
                const parts = preselectedCuentaId.split("-");
                const orderAccountId = Number(parts[parts.length - 1]);

                if (!orderAccountId || isNaN(orderAccountId)) {
                    toast.error(
                        "No se pudo identificar la cuenta. Regrese e intente de nuevo.",
                    );
                    return;
                }

                await orderApi.addProduct({
                    orderAccountId,
                    createdBy: userName,
                    details: cart.map((item) => ({
                        productCode: item.code,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        discount: 0,
                        notes: "",
                    })),
                });

                addItemsToOrder(preselectedCuentaId, items);
                toast.success(
                    `Productos agregados a Mesa ${preselectedTable} - Cuenta ${preselectedCuentaNumber}`,
                    { icon: "🍽️" },
                );
                onOrderSent();
                navigate("/takeout");
                return;
            }

            if (mode === "mesa" && !selectedTable) {
                toast.error("Selecciona una mesa");
                return;
            }
            if (!orderId) {
                toast.error(
                    "El sistema aún está preparando la orden. Espere un momento e intente de nuevo.",
                );
                return;
            }

            await orderApi.save({
                orderId,
                createdBy: userName,
                orderType: mode === "llevar",
                tableId: mode === "mesa" ? (selectedTable ?? undefined) : undefined,
                details: cart.map((item) => ({
                    productCode: item.code,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    discount: 0,
                    notes: "",
                })),
            });

            if (mode === "llevar") {
                const cuentaNumber = getNextCuentaNumber(PARA_LLEVAR_TABLE);
                addOrder(PARA_LLEVAR_TABLE, cuentaNumber, items, userName, orderId);
                toast.success(`Orden Para Llevar #${cuentaNumber} enviada a caja`, {
                    icon: "🛍️",
                });
            } else if (
                selectedAction === "add-to-cuenta" &&
                selectedCuentaId &&
                selectedTable
            ) {
                addItemsToOrder(selectedCuentaId, items);
                toast.success(
                    `Productos agregados a Mesa ${selectedTable} - Cuenta ${activeCuentas.find((c) => c.id === selectedCuentaId)?.cuentaNumber}`,
                    { icon: "🍽️" },
                );
            } else if (selectedTable) {
                const cuentaNumber = getNextCuentaNumber(selectedTable);
                addOrder(selectedTable, cuentaNumber, items, userName, orderId);
                toast.success(
                    `Orden enviada - Mesa ${selectedTable}${cuentaNumber > 1 ? ` (Cuenta ${cuentaNumber})` : ""}`,
                    { icon: "🍽️" },
                );
            }

            onOrderSent();
            setSelectedTable(null);
        } catch (error) {
            console.error("[Order] Error al guardar:", error);
            toast.error(
                "No se pudo enviar la orden. Verifique la conexión e intente de nuevo.",
                { duration: 5000 },
            );
        }
    };

    const handleCajeroParaLlevarInvoice = async () => {
        if (cart.length === 0) {
            toast.error("Agrega al menos un producto");
            return;
        }
        if (!isPaymentSufficient) {
            toast.error("El monto recibido es insuficiente");
            return;
        }
        if (!orderId) {
            toast.error(
                "El sistema aún está preparando la orden. Espere un momento e intente de nuevo.",
            );
            return;
        }

        try {
            await orderApi.save({
                orderId,
                createdBy: userName,
                orderType: true,
                details: cart.map((item) => ({
                    productCode: item.code,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    discount: 0,
                    notes: "",
                })),
            });

            const accounts = await orderApi.getOrderAccountWithDetails(orderId);
            const account = Array.isArray(accounts) ? accounts[0] : accounts;
            const orderAccountId = account?.orderAccountId;

            if (!orderAccountId) {
                toast.error(
                    "No se pudo obtener la información de la cuenta. Intente de nuevo o contacte a soporte.",
                    { duration: 5000 },
                );
                return;
            }

            const pm = paymentMethod === "tarjeta" ? "CARD" : "CASH";
            await handleInvoiceFlow({ orderAccountId, paymentmethod: pm });

            if (paymentMethod === "efectivo" && paidInCordobas > total) {
                const changeAmount = paidInCordobas - total;
                toast.success(`Facturado. Cambio: C$ ${changeAmount.toFixed(2)}`, {
                    icon: "\uD83D\uDECD\uFE0F",
                    duration: 5000,
                });
            } else {
                toast.success("Facturado correctamente", {
                    icon: "\uD83D\uDECD\uFE0F",
                });
            }

            setAmountPaid("");
            setPaymentMethod("efectivo");
            onOrderSent();
        } catch (error) {
            console.error("[TakeoutCartPanel] Error al facturar:", error);
            toast.error(
                "No se pudo generar la factura. Verifique la conexión e intente de nuevo. Si el problema persiste, llame a soporte.",
                { duration: 6000 },
            );
        }
    };

    return {
        mode,
        setMode,
        selectedTable,
        setSelectedTable,
        isTableDropdownOpen,
        setIsTableDropdownOpen,
        selectedAction,
        setSelectedAction,
        selectedCuentaId,
        setSelectedCuentaId,
        paymentMethod,
        setPaymentMethod,
        amountPaid,
        setAmountPaid,
        paidInCordobas,
        setPaidInCordobas,
        isPreselected,
        isCajero,
        activeCuentas,
        apiTables,
        totalItems,
        subtotal,
        total,
        isPaymentSufficient,
        handleSendOrder,
        handleCajeroParaLlevarInvoice,
        navigate,
        getActiveOrdersByTable,
    };
};

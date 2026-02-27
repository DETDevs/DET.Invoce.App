import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Send,
  ChevronDown,
  Wallet,
  CreditCard,
  FileText,
  Package,
  UtensilsCrossed,
} from "lucide-react";
import { CartItemRow } from "@/features/orders/components/CartItemRow";
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

type TakeoutCartPanelProps = {
  cart: CartItem[];
  orderNumber: number;
  orderId: number | null;
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemoveFromCart: (id: number) => void;
  onOrderSent: () => void;
  onCancel: () => void;
  tableCount?: number;
  preselectedTable?: number;
  preselectedCuentaId?: string;
  preselectedCuentaNumber?: number;
};

const PARA_LLEVAR_TABLE = 0;

export const TakeoutCartPanel = ({
  cart,
  orderNumber,
  orderId,
  onUpdateQuantity,
  onRemoveFromCart,
  onOrderSent,
  onCancel,
  tableCount: _tableCount,
  preselectedTable,
  preselectedCuentaId,
  preselectedCuentaNumber,
}: TakeoutCartPanelProps) => {
  const isPreselected =
    preselectedTable !== undefined && preselectedTable !== null;
  const [mode, setMode] = useState<OrderMode>(isPreselected ? "mesa" : "mesa");
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

  const { user } = useAuthStore();
  const isCajero = user?.role === "cajero" || user?.role === "admin";
  const userName = user?.name || "Mesero";

  const {
    addOrder,
    addItemsToOrder,
    getActiveOrdersByTable,
    getNextCuentaNumber,
  } = useTakeoutStore();

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

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.15;
  const total = subtotal + tax;
  const paidValue = parseFloat(amountPaid) || 0;
  const change = paidValue - total;
  const isPaymentSufficient =
    paymentMethod === "tarjeta" ||
    (paymentMethod === "efectivo" && paidValue >= total);

  const navigate = useNavigate();

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

      if (paymentMethod === "efectivo" && change > 0) {
        toast.success(`Facturado. Cambio: C$ ${change.toFixed(2)}`, {
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

  const [apiTables, setApiTables] = useState<RestaurantTable[]>([]);

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

  return (
    <div className="bg-white h-full grid grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-[#2D2D2D]">
            {isPreselected
              ? `Mesa ${preselectedTable} — Cuenta ${preselectedCuentaNumber}`
              : `Orden #${orderNumber}`}
          </h2>
          <span className="bg-[#F9F1D8] text-[#593D31] text-xs font-bold px-2 py-1 rounded-lg">
            {totalItems} Items
          </span>
        </div>

        {isPreselected && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-3">
            <UtensilsCrossed size={14} className="text-blue-600" />
            <p className="text-xs text-blue-800 font-medium">
              Agregando productos a la cuenta existente
            </p>
          </div>
        )}

        {!isPreselected && (
          <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setMode("mesa");
                setSelectedTable(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "mesa"
                  ? "bg-white text-[#593D31] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <UtensilsCrossed size={14} />
              En Mesa
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("llevar");
                setSelectedTable(null);
                setIsTableDropdownOpen(false);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === "llevar"
                  ? "bg-white text-[#593D31] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package size={14} />
              Para Llevar
            </button>
          </div>
        )}
      </div>

      <div className="overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-hide">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <ShoppingBag size={48} className="mb-4 opacity-50" />
            <p className="font-medium">Tu carrito está vacío</p>
            <p className="text-sm">Agrega productos para empezar una orden.</p>
          </div>
        ) : (
          cart.map((item) => (
            <CartItemRow
              key={`${item.id}-${item.name}`}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveFromCart}
              hidePrice={mode === "mesa" || !isCajero}
            />
          ))
        )}
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
        {mode === "mesa" && !isPreselected && (
          <>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">
                Mesa
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTableDropdownOpen(!isTableDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#2D2D2D] hover:border-[#E8BC6E] transition-colors"
                >
                  <span>
                    {selectedTable
                      ? `Mesa ${selectedTable}`
                      : "Seleccionar mesa..."}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isTableDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isTableDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-20">
                    {apiTables.map((t) => {
                      const tableActive =
                        getActiveOrdersByTable(t.tableId).length > 0;
                      return (
                        <button
                          key={t.tableId}
                          onClick={() => {
                            setSelectedTable(t.tableId);
                            setIsTableDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between ${selectedTable === t.tableId ? "bg-[#F9F1D8] text-[#593D31]" : "text-[#2D2D2D]"}`}
                        >
                          <span>Mesa {t.tableNumber}</span>
                          {t.isOccupied ? (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                              Ocupada
                            </span>
                          ) : tableActive ? (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                              Activa
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                              Libre
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {selectedTable && activeCuentas.length > 0 && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-xs font-bold text-gray-500 uppercase">
                  ¿Qué deseas hacer?
                </label>
                <div className="space-y-2">
                  {activeCuentas.map((cuenta) => (
                    <button
                      key={cuenta.id}
                      type="button"
                      onClick={() => {
                        setSelectedAction("add-to-cuenta");
                        setSelectedCuentaId(cuenta.id);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                        selectedAction === "add-to-cuenta" &&
                        selectedCuentaId === cuenta.id
                          ? "bg-blue-50 border-blue-400 text-blue-800"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      Agregar a Cuenta {cuenta.cuentaNumber} (
                      {cuenta.items.length} items)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {mode === "llevar" && !isCajero && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <Package size={20} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              La orden se enviará a <strong>Caja</strong> como{" "}
              <strong>Para Llevar</strong>.
            </p>
          </div>
        )}

        {mode === "llevar" && isCajero && cart.length > 0 && (
          <>
            <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-100">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>C$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>IVA (15%)</span>
                <span>C$ {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-lg font-bold text-[#2D2D2D]">Total</span>
                <span className="text-xl font-bold text-[#2D2D2D]">
                  C$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("efectivo")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                    paymentMethod === "efectivo"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Wallet size={14} /> Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("tarjeta");
                    setAmountPaid(total.toFixed(2));
                  }}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                    paymentMethod === "tarjeta"
                      ? "bg-sky-50 border-sky-400 text-sky-800"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <CreditCard size={14} /> Tarjeta
                </button>
              </div>
            </div>

            {paymentMethod === "efectivo" && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">
                  Monto Recibido
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    C$
                  </span>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCajeroParaLlevarInvoice()
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-sm font-bold"
                    placeholder={total.toFixed(2)}
                    min="0"
                  />
                </div>
                {amountPaid !== "" && (
                  <div
                    className={`flex justify-between items-center p-2.5 rounded-lg ${change >= 0 ? "bg-green-100 text-green-800" : "bg-red-50 text-red-700"}`}
                  >
                    <span className="font-bold text-sm">
                      {change >= 0 ? "Cambio" : "Faltante"}
                    </span>
                    <span className="font-bold text-sm">
                      C$ {Math.abs(change).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="space-y-3 pt-1">
          {mode === "llevar" && isCajero ? (
            <button
              onClick={handleCajeroParaLlevarInvoice}
              disabled={cart.length === 0 || !isPaymentSufficient}
              className="w-full py-3.5 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              Facturar
            </button>
          ) : (
            <button
              onClick={handleSendOrder}
              disabled={
                cart.length === 0 || (mode === "mesa" && !selectedTable)
              }
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {isPreselected
                ? "Agregar Productos"
                : mode === "llevar"
                  ? "Enviar a Caja"
                  : "Tomar Orden"}
            </button>
          )}
          <button
            onClick={isPreselected ? () => navigate("/takeout") : onCancel}
            className="w-full py-3 bg-white border border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            {isPreselected ? "Volver" : "Cancelar Orden"}
          </button>
        </div>
      </div>
    </div>
  );
};

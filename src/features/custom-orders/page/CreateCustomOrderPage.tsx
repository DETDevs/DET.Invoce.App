import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Save,
  Loader2,
  Palette,
  Package,
} from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { useCreateOrder } from "@/features/custom-orders/hooks/useCreateOrder";
import { AddCustomProductForm } from "@/features/custom-orders/components/AddCustomProductForm";
import { AddProductForm } from "@/features/custom-orders/components/AddProductForm";
import { OrderItemsList } from "@/features/custom-orders/components/OrderItemsList";

type OrderTab = "personalizado" | "estandar";

export const CreateCustomOrderPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OrderTab>("personalizado");
  const {
    formData,
    handleInputChange,
    addItem,
    addCustomItem,
    removeItem,
    calculateTotal,
    handleSubmit,
    isSaving,
  } = useCreateOrder();

  const total = calculateTotal();
  const deposit = Number(formData.deposit || 0);
  const remaining = Math.max(0, total - deposit);

  let paymentStatus = "Pendiente";
  let statusColor = "bg-red-100 text-red-700";

  if (total > 0) {
    if (deposit >= total) {
      paymentStatus = "Pagado";
      statusColor = "bg-green-100 text-green-700";
    } else if (deposit > 0) {
      paymentStatus = "Abonado";
      statusColor = "bg-amber-100 text-amber-700";
    }
  }

  const tabs: { key: OrderTab; label: string; icon: React.ReactNode }[] = [
    {
      key: "personalizado",
      label: "Personalizado",
      icon: <Palette size={16} />,
    },
    { key: "estandar", label: "Estándar", icon: <Package size={16} /> },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#593D31]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">
            Realizar Pedido
          </h1>
        </div>

        <div className="flex rounded-xl overflow-hidden mb-6 border border-stone-200 bg-white max-w-md">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? "bg-[#593D31] text-white shadow-inner"
                  : "text-[#593D31] hover:bg-stone-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8"
        >
          <div className="xl:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-[#2D2D2D] mb-4 border-b border-gray-100 pb-2">
                Información del Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Nombre Cliente
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
                    placeholder="Nombre Cliente"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Identificación (Opcional)
                  </label>
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
                    placeholder="Identificación (Opcional)"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-bold text-[#2D2D2D] mb-4 border-b border-gray-100 pb-2">
                Detalle del Pedido
              </h2>

              {activeTab === "personalizado" ? (
                <AddCustomProductForm onAdd={addCustomItem} />
              ) : (
                <AddProductForm onAdd={addItem} />
              )}

              <div className="mt-6">
                <OrderItemsList items={formData.items} onRemove={removeItem} />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">Resumen</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <div
                    className={`w-full px-4 py-2 rounded-xl font-bold text-center text-sm ${statusColor}`}
                  >
                    {paymentStatus}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Fecha de Entrega
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar size={16} />
                    </div>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] font-medium"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Adelanto/Abono
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      C$
                    </span>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] font-medium"
                      placeholder="Adelanto/Abono"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Comentarios
                  </label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] resize-none text-sm"
                    placeholder="Comentarios"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      C${" "}
                      {total.toLocaleString("es-NI", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Abonado</span>
                    <span>
                      C${" "}
                      {deposit.toLocaleString("es-NI", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-dashed border-gray-200">
                    <span className="text-gray-500 font-medium">
                      Restante a Pagar
                    </span>
                    <span className="text-xl font-bold text-[#2D2D2D]">
                      C${" "}
                      {remaining.toLocaleString("es-NI", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#E8BC6E] hover:bg-[#dca34b] text-white py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isSaving ||
                  formData.items.length === 0 ||
                  !formData.customerName ||
                  !formData.dueDate
                }
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} /> Guardar Pedido
                  </>
                )}
              </button>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

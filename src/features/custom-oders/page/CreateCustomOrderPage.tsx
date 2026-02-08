import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Save } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { AddProductForm } from "../components/AddProductForm";
import { OrderItemsList } from "../components/OrderItemsList";

export const CreateCustomOrderPage = () => {
  const navigate = useNavigate();
  const {
    formData,
    handleInputChange,
    addItem,
    removeItem,
    calculateTotal,
    handleSubmit,
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

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-[#2D2D2D] mb-4 border-b border-gray-100 pb-2">
                Información del Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Nombre Cliente *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Identificación (Opcional)
                  </label>
                  <input
                    type="text"
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
                    placeholder="Cédula o ID"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-bold text-[#2D2D2D] mb-4 border-b border-gray-100 pb-2">
                Detalle del Pedido
              </h2>
              <AddProductForm onAdd={addItem} />
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
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Estado del Pago
                  </label>
                  <div
                    className={`w-full px-4 py-2 rounded-xl font-bold text-center ${statusColor}`}
                  >
                    {paymentStatus}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Fecha de Entrega *
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
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Adelanto / Abono
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
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Comentarios
                  </label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] resize-none text-sm"
                    placeholder="Instrucciones especiales..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>C$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Abonado</span>
                    <span>- C$ {deposit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-dashed border-gray-200">
                    <span className="text-gray-500 font-medium">
                      Restante a Pagar
                    </span>
                    <span className="text-2xl font-bold text-[#2D2D2D]">
                      C$ {remaining.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#E8BC6E] hover:bg-[#dca34b] text-white py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  formData.items.length === 0 ||
                  !formData.customerName ||
                  !formData.dueDate
                }
              >
                <Save size={20} /> Guardar Pedido
              </button>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

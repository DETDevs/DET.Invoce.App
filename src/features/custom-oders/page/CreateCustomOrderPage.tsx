import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { AddProductForm } from "../components/AddProductForm";
import { OrderItemsList } from "../components/OrderItemsList";

export const CreateCustomOrderPage = () => {
  const navigate = useNavigate();
  const { formData, handleInputChange, addItem, removeItem, calculateTotal, handleSubmit } = useCreateOrder();

  const total = calculateTotal();
  const remaining = total - Number(formData.deposit || 0);

  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#593D31]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">Realizar Pedido</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-[#2D2D2D] mb-4 border-b border-gray-100 pb-2">
                Información del Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nombre Cliente *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Identificación (Opcional)</label>
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
              <OrderItemsList items={formData.items} onRemove={removeItem} />
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-bold text-[#2D2D2D] mb-4">Resumen</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Estado del Pedido
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Adelanto / Abono</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400">C$</span>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E]"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Comentarios</label>
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] resize-none"
                    placeholder="Instrucciones especiales..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span> <span>C$ {total.toFixed(2)}</span></div>
                  <div className="flex justify-between text-green-600"><span>Abonado</span> <span>- C$ {Number(formData.deposit || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between text-xl font-bold text-[#2D2D2D] pt-2"><span>Restante</span> <span>C$ {remaining.toFixed(2)}</span></div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#E8BC6E] hover:bg-[#dca34b] text-white py-3 rounded-xl font-bold shadow-md transition-all active:scale-95"
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
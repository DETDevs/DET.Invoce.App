import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { CreateOrderFormData } from "@/features/custom-orders/types";
import type { Order, OrderItem, ProductOption } from "@/shared/types";
import { useOrdersStore } from "../store/useOrdersStore";
import reservationOrderApi from "@/api/reservation-order/ReservationOrderAPI";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useCashBox } from "@/features/settings/pages/CashBoxContext";

export const useCreateOrder = () => {
  const navigate = useNavigate();
  const { addOrder } = useOrdersStore();
  const { user } = useAuthStore();
  const { session } = useCashBox();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<CreateOrderFormData>({
    customerName: "",
    customerId: "",
    items: [],
    deposit: 0,
    comments: "",
    status: "Pendiente",
    dueDate: "",
  });

  useEffect(() => {
    setFormData((prev) => {
      const total = prev.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const deposit = Number(prev.deposit) || 0;
      return {
        ...prev,
        status: deposit >= total && total > 0 ? "Pagado" : deposit > 0 ? "Abonado" : "Pendiente",
      };
    });
  }, [formData.items, formData.deposit]);

  const updateField = (field: keyof CreateOrderFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const addItem = (product: ProductOption, quantity: number, description: string) => {
    const newItem: OrderItem = {
      productId: product.id,
      productCode: product.code,
      name: product.name,
      price: product.price,
      quantity,
      description: description || undefined,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const addCustomItem = (name: string, quantity: number, price: number) => {
    const newItem: OrderItem = {
      productId: 0,
      productCode: "PERSONALIZADO",
      name,
      price,
      quantity,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }

    setIsSaving(true);
    try {
      const total = formData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const deposit = Number(formData.deposit) || 0;

      const payload = {
        customer: formData.customerName,
        identificationCustomer: formData.customerId || null,
        deliveryDate: formData.dueDate,
        orderDate: new Date().toISOString(),
        status: "Pending",
        deposit,
        total,
        notes: formData.comments?.trim() || null,
        createdBy: user?.name || "Sistema",
        cashRegisterId: session?.cashRegisterId ?? null,
        details: formData.items.map((item) => {
          let itemNotes = item.description || "";
          if (item.productCode === "PERSONALIZADO") {
            itemNotes = item.name + (item.description ? ` - ${item.description}` : "");
          }

          return {
            productCode: item.productCode,
            quantity: item.quantity,
            unitPrice: item.price,
            discount: 0,
            notes: itemNotes || null,
          };
        }),
      };

      const result = await reservationOrderApi.save(payload);

      const reservationOrderId: number | undefined =
        typeof result === 'number'
          ? result
          : (result?.reservationOrderId ?? result?.id ?? undefined);

      const formattedItems = formData.items.map(
        (item) => `${item.quantity}x ${item.name}${item.description ? ` (${item.description})` : ""}`
      );

      const newOrder: Order = {
        id: (typeof result === 'object' && result?.orderNumber) ? result.orderNumber : `ORD-${Date.now()}`,
        reservationOrderId,
        customer: formData.customerName,
        identificationCustomer: formData.customerId || undefined,
        items: formattedItems,
        rawItems: formData.items,
        total,
        deposit,
        paymentStatus: formData.status,
        dueDate: formData.dueDate,
        status: "pending",
      };

      addOrder(newOrder);
      toast.success("Pedido guardado correctamente");
      navigate("/tablero");
    } catch (err) {
      console.error("[useCreateOrder] Error al guardar pedido:", err);
      toast.error("No se pudo guardar el pedido. Verifique la conexión e intente de nuevo.", { duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    isSaving,
    updateField,
    handleInputChange,
    addItem,
    addCustomItem,
    removeItem,
    calculateTotal,
    handleSubmit,
  };
};

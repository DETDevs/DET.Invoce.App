import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { CreateOrderFormData } from "@/features/custom-orders/types";
import type { Order, OrderItem, ProductOption, PaymentStatus } from "@/shared/types";
import { useOrdersStore } from "@/features/custom-orders/store/useOrdersStore";

export const useCreateOrder = () => {
  const navigate = useNavigate();
  const { addOrder } = useOrdersStore();

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
      const total = prev.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      const deposit = Number(prev.deposit) || 0;

      let newStatus: PaymentStatus = "Pendiente";
      if (total > 0) {
        if (deposit >= total) {
          newStatus = "Pagado";
        } else if (deposit > 0) {
          newStatus = "Abonado";
        }
      }

      if (prev.status !== newStatus) {
        return { ...prev, status: newStatus };
      }
      return prev;
    });
  }, [formData.items, formData.deposit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = (product: ProductOption, quantity: number, description: string) => {
    const newItem: OrderItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      description,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    toast.success("Producto agregado al pedido");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      toast.error("El nombre del cliente es obligatorio");
      return;
    }
    if (!formData.dueDate) {
      toast.error("La fecha de entrega es obligatoria");
      return;
    }
    if (formData.items.length === 0) {
      toast.error("Debes agregar al menos un producto");
      return;
    }

    const total = calculateTotal();
    const deposit = Number(formData.deposit) || 0;

    // Transform items to string array for Order type compatibility
    const formattedItems = formData.items.map(item =>
      `${item.quantity}x ${item.name}${item.description ? ` (${item.description})` : ''}`
    );

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: formData.customerName,
      items: formattedItems,
      total: total,
      deposit: deposit,
      paymentStatus: formData.status,
      dueDate: formData.dueDate,
      status: "pending",
    };

    console.log("Creando pedido:", newOrder);
    addOrder(newOrder);
    toast.success("Pedido creado exitosamente");
    navigate("/tablero");
  };

  return {
    formData,
    handleInputChange,
    addItem,
    removeItem,
    calculateTotal,
    handleSubmit,
    setFormData
  };
};
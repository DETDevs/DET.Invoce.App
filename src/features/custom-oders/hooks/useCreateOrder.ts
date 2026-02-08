import { useState } from "react";
import toast from "react-hot-toast";
import type { CreateOrderFormData, OrderItem, ProductOption } from "../types";

export const useCreateOrder = () => {
  const [formData, setFormData] = useState<CreateOrderFormData>({
    customerName: "",
    customerId: "",
    items: [],
    deposit: 0,
    comments: "",
    status: "Pendiente",
  });

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
    if (formData.items.length === 0) {
      toast.error("Debes agregar al menos un producto");
      return;
    }

    console.log("Enviando pedido:", formData);
    toast.success("Pedido creado exitosamente");
  };

  return { formData, handleInputChange, addItem, removeItem, calculateTotal, handleSubmit };
};

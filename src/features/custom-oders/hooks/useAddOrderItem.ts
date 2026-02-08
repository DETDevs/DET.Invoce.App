import { useState, useMemo } from "react";
import type { ProductOption } from "../types";

export const useAddOrderItem = (products: ProductOption[]) => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [description, setDescription] = useState<string>("");

  const isValid = useMemo(() => {
    const qty = parseInt(quantity, 10);
    return Boolean(selectedProductId) && !isNaN(qty) && qty > 0;
  }, [selectedProductId, quantity]);

  const handleAddItem = (
    onAdd: (
      product: ProductOption,
      quantity: number,
      description: string,
    ) => void,
  ) => {
    const product = products.find((p) => p.id === Number(selectedProductId));
    const qty = parseInt(quantity, 10);

    if (product && !isNaN(qty) && qty > 0) {
      onAdd(product, qty, description);
      setQuantity("1");
      setDescription("");
      setSelectedProductId("");
    }
  };

  return {
    selectedProductId,
    setSelectedProductId,
    quantity,
    setQuantity,
    description,
    setDescription,
    isValid,
    handleAddItem,
  };
};
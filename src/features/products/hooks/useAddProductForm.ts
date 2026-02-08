import { useState } from "react";
import toast from "react-hot-toast";

export interface ProductFormData {
  name: string;
  price: string;
  stock: string;
  minStock: string;
  category: string;
}

interface UseAddProductFormProps {
  onSubmitSuccess: (data: ProductFormData & { imageFile: File | null }) => void;
}

export const useAddProductForm = ({
  onSubmitSuccess,
}: UseAddProductFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    stock: "",
    minStock: "",
    category: "Cake",
  });

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.price.trim() !== "" &&
    formData.stock.trim() !== "" &&
    formData.minStock.trim() !== "" &&
    imageFile !== null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value, labels } = e.target;
    const labelText = labels?.[0]?.textContent?.replace("*", "").trim() || name;
    if (!value) {
      toast.error(`El campo ${labelText} es obligatorio`, {
        id: name,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    onSubmitSuccess({ ...formData, imageFile });
  };

  return {
    formData,
    setImageFile,
    isFormValid,
    handleInputChange,
    handleBlur,
    handleSubmit,
  };
};
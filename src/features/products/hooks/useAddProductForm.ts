import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import categoryApi from "@/api/category/CategoryAPI";
import type { TCategory, TSubCategory } from "@/api/category/types";

export interface ProductFormData {
  name: string;
  price: string;
  stock: string;
  minStock: string;
  divideQuantityBy: string;
  category: string;
  subCategoryId: number | null;
}

interface UseAddProductFormProps {
  onSubmitSuccess: (data: ProductFormData & { imageFile: File | null }) => void;
}

export const useAddProductForm = ({
  onSubmitSuccess,
}: UseAddProductFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [subCategories, setSubCategories] = useState<TSubCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    stock: "",
    minStock: "",
    divideQuantityBy: "",
    category: "",
    subCategoryId: null,
  });

  useEffect(() => {
    setIsLoadingCategories(true);
    categoryApi
      .getAll()
      .then((data) => {
        const active = (data || []).filter((c) => c.isActive);
        setCategories(active);
        if (active.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: active[0].categoryCode }));
        }
      })
      .catch(() => {
        toast.error("Error al cargar categorías");
      })
      .finally(() => setIsLoadingCategories(false));
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      setSubCategories([]);
      return;
    }
    const selected = categories.find((c) => c.categoryCode === formData.category);
    const activeSubs = (selected?.subCategories || []).filter((s) => s.isActive);
    setSubCategories(activeSubs);
    setFormData((prev) => ({ ...prev, subCategoryId: null, divideQuantityBy: "" }));
  }, [formData.category, categories]);

  const isNaturalBeverage = useMemo(() => {
    if (!formData.subCategoryId || categories.length === 0) return false;
    const cat = categories.find((c) => c.categoryCode === formData.category);
    if (!cat?.categoryName?.toLowerCase().includes("bebida")) return false;
    const sub = (cat.subCategories || []).find(
      (s) => s.subCategoryId === formData.subCategoryId,
    );
    return sub?.name?.toLowerCase().includes("refresco") ?? false;
  }, [formData.category, formData.subCategoryId, categories]);

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.price.trim() !== "" &&
    formData.stock.trim() !== "" &&
    formData.minStock.trim() !== "" &&
    (!isNaturalBeverage || formData.divideQuantityBy.trim() !== "");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = useCallback((categoryCode: string) => {
    setFormData((prev) => ({ ...prev, category: categoryCode, subCategoryId: null, divideQuantityBy: "" }));
  }, []);

  const handleSubCategoryChange = useCallback((subCategoryId: string) => {
    const id = subCategoryId ? Number(subCategoryId) : null;
    setFormData((prev) => ({ ...prev, subCategoryId: id, divideQuantityBy: "" }));
  }, []);

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
    isNaturalBeverage,
    handleInputChange,
    handleCategoryChange,
    handleSubCategoryChange,
    handleBlur,
    handleSubmit,
    categories,
    subCategories,
    isLoadingCategories,
  };
};
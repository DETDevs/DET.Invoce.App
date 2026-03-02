import React, { useEffect, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { ImageUploadField } from "@/shared/ui/ImageUploadField";
import toast from "react-hot-toast";
import type { TProduct } from "@/api/products/types";
import { getCurrencySymbol } from "@/shared/utils/currency";
import type { TCategory, TSubCategory } from "@/api/category/types";
import categoryApi from "@/api/category/CategoryAPI";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: TProduct | null;
  onSave: (updatedProduct: TProduct) => void;
}

export const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
}: EditProductModalProps) => {
  const [formData, setFormData] = useState<TProduct | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<TCategory[]>([]);
  const [subCategories, setSubCategories] = useState<TSubCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingCategories(true);
      categoryApi
        .getAll()
        .then((data) => {
          const active = (data || []).filter((c) => c.isActive);
          setCategories(active);
        })
        .catch(() => {
          toast.error("Error al cargar categorías");
        })
        .finally(() => setIsLoadingCategories(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      setNewImageFile(null);
      setIsSaving(false);
    }
  }, [product]);

  useEffect(() => {
    if (!formData || categories.length === 0) {
      setSubCategories([]);
      return;
    }
    const selected = categories.find(
      (c) => c.categoryCode === formData.categoryCode,
    );
    const activeSubs = (selected?.subCategories || []).filter(
      (s) => s.isActive,
    );
    setSubCategories(activeSubs);
  }, [formData?.categoryCode, categories]);

  if (!isOpen || !formData) return null;

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.price > 0 &&
    formData.stockMinimum >= 0 &&
    (formData.imageUrl || newImageFile);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      toast.error(`El campo ${e.target.name} no puede estar vacío`, {
        id: `error-${e.target.name}`,
      });
    }
  };

  const handleCategoryChange = (categoryCode: string) => {
    const cat = categories.find((c) => c.categoryCode === categoryCode);
    setFormData({
      ...formData,
      categoryCode,
      categoryName: cat?.categoryName || "",
      subCategoryId: undefined,
      subCategoryName: undefined,
    });
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    const sub = subCategories.find(
      (s) => s.subCategoryId === Number(subCategoryId),
    );
    setFormData({
      ...formData,
      subCategoryId: sub ? sub.subCategoryId : undefined,
      subCategoryName: sub ? sub.name : undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Por favor revisa los campos obligatorios");
      return;
    }

    if (formData) {
      setIsSaving(true);
      onSave(formData);
      onClose();
    }
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: "right 1rem center",
    backgroundSize: "1.5em 1.5em",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-[#593D31]">Editar Producto</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8">
          <form id="edit-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <ImageUploadField
                label="Imagen del Producto"
                currentImage={formData.imageUrl || ""}
                onImageSelected={setNewImageFile}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Precio
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400">
                      {getCurrencySymbol()}
                    </span>
                    <input
                      type="number"
                      name="precio"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      onBlur={handleBlur}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Cantidad Mínima
                  </label>
                  <input
                    type="number"
                    name="stockMinimum"
                    value={formData.stockMinimum}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockMinimum: Number(e.target.value),
                      })
                    }
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Categoría
                  </label>
                  {isLoadingCategories ? (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2 text-gray-400">
                      <Loader2 size={16} className="animate-spin" /> Cargando...
                    </div>
                  ) : (
                    <select
                      value={formData.categoryCode}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D] appearance-none bg-no-repeat bg-right"
                      style={selectStyle}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryCode} value={cat.categoryCode}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Subcategoría
                  </label>
                  <select
                    value={formData.subCategoryId ?? ""}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    disabled={subCategories.length === 0}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D] appearance-none bg-no-repeat bg-right disabled:opacity-50 disabled:cursor-not-allowed"
                    style={selectStyle}
                  >
                    <option value="">
                      {subCategories.length === 0
                        ? "Sin subcategorías"
                        : "Seleccionar subcategoría"}
                    </option>
                    {subCategories.map((sub) => (
                      <option key={sub.subCategoryId} value={sub.subCategoryId}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-form"
            disabled={!isFormValid || isSaving}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-md transition-all active:scale-95 ${
              isFormValid && !isSaving
                ? "bg-[#E8BC6E] hover:bg-[#dca34b] text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={20} /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

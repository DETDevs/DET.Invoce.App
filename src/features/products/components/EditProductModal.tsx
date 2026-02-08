import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { ImageUploadField } from "@/shared/ui/ImageUploadField";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => void;
}

export const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
}: EditProductModalProps) => {
  const [formData, setFormData] = useState<Product | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setNewImageFile(null);
    }
  }, [product]);

  if (!isOpen || !formData) return null;

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.price > 0 &&
    formData.stock >= 0 &&
    (formData.image || newImageFile);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      toast.error(`El campo ${e.target.name} no puede estar vacío`, {
        id: `error-${e.target.name}`,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Por favor revisa los campos obligatorios");
      return;
    }

    if (formData) {
      console.log("Actualizando producto...", { ...formData, newImageFile });
      onSave(formData);
      toast.success("Producto actualizado correctamente");
      onClose();
    }
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
                currentImage={formData.image}
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
                      C$
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
                    Cantidad Minima
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: Number(e.target.value),
                      })
                    }
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D] appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 1rem center",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    <option value="Cake">Pasteles</option>
                    <option value="Panes">Panes</option>
                    <option value="Pastry">Repostería</option>
                    <option value="Bebidas">Bebidas</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
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
            disabled={!isFormValid}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-md transition-all active:scale-95 ${
              isFormValid
                ? "bg-[#E8BC6E] hover:bg-[#dca34b] text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            <Save size={20} />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

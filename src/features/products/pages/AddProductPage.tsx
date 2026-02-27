import { Save, ArrowLeft, Loader2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/Card";
import { ImageUploadField } from "@/shared/ui/ImageUploadField";
import toast from "react-hot-toast";
import { useAddProductForm } from "@/features/products/hooks/useAddProductForm";
import { productApi } from "@/api/products";

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
  backgroundPosition: "right 1rem center",
  backgroundSize: "1.5em 1.5em",
};

export const AddProductPage = () => {
  const navigate = useNavigate();
  const {
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
  } = useAddProductForm({
    onSubmitSuccess: async (data) => {
      try {
        await productApi.save({
          productId: 0,
          code: "",
          categoryCode: data.category,
          subCategoryId: data.subCategoryId ?? undefined,
          name: data.name,
          description: "",
          price: Number(data.price),
          trackInventory: true,
          unitId: isNaturalBeverage ? "2" : 0,
          divideQuantityBy: isNaturalBeverage
            ? Number(data.divideQuantityBy)
            : 0,
          isActive: true,
          quantity: Number(data.stock),
          stockMinimum: Number(data.minStock),
        });
        toast.success("Producto creado exitosamente!");
        navigate("/productos");
      } catch (err) {
        console.error("Error creating product:", err);
        toast.error("No se pudo crear el producto");
      }
    },
  });

  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/productos")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#593D31]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">Nuevo Producto</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-8">
              <ImageUploadField
                label="Imagen del Producto"
                onImageSelected={setImageFile}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-8">
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide"
                  >
                    Nombre del Producto <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Pastel de Zanahoria"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide"
                  >
                    Precio <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400">
                      C$
                    </span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {isNaturalBeverage
                        ? "Cantidad Inicial (Ltrs)"
                        : "Cantidad Inicial"}{" "}
                      <span className="text-red-400">*</span>
                      {isNaturalBeverage && (
                        <span className="relative group">
                          <Info
                            size={14}
                            className="text-gray-300 hover:text-gray-500 cursor-help transition-colors"
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity normal-case tracking-normal font-normal">
                            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                              <span className="block w-2 h-2 bg-gray-800 rotate-45" />
                            </span>
                            Cantidad total de litros disponibles para preparar
                            refrescos.
                          </span>
                        </span>
                      )}
                    </span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={isNaturalBeverage ? "Ej: 10 Ltrs" : "0"}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                {isNaturalBeverage && (
                  <div>
                    <label
                      htmlFor="divideQuantityBy"
                      className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        Porción por servicio (ML){" "}
                        <span className="text-red-400">*</span>
                        <span className="relative group">
                          <Info
                            size={14}
                            className="text-gray-300 hover:text-gray-500 cursor-help transition-colors"
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity normal-case tracking-normal font-normal">
                            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                              <span className="block w-2 h-2 bg-gray-800 rotate-45" />
                            </span>
                            Cantidad de ML que se usa por cada vaso o servicio
                            vendido.
                          </span>
                        </span>
                      </span>
                    </label>
                    <input
                      type="number"
                      id="divideQuantityBy"
                      name="divideQuantityBy"
                      value={formData.divideQuantityBy}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="Ej: 300 ML"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="minStock"
                    className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {isNaturalBeverage
                        ? "Cantidad Mínima (UND)"
                        : "Cantidad Mínima"}{" "}
                      <span className="text-red-400">*</span>
                      {isNaturalBeverage && (
                        <span className="relative group">
                          <Info
                            size={14}
                            className="text-gray-300 hover:text-gray-500 cursor-help transition-colors"
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity normal-case tracking-normal font-normal">
                            <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                              <span className="block w-2 h-2 bg-gray-800 rotate-45" />
                            </span>
                            Cantidad mínima de porciones/servicios antes de
                            alerta de stock bajo.
                          </span>
                        </span>
                      )}
                    </span>
                  </label>
                  <input
                    type="number"
                    id="minStock"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={isNaturalBeverage ? "Ej: 100 UND" : "0"}
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
                      value={formData.category}
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

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/productos")}
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`flex items-center gap-2 px-8 py-3 font-bold rounded-xl shadow-md transition-all active:scale-95 ${
                  isFormValid
                    ? "bg-[#E8BC6E] hover:bg-[#dca34b] text-white cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                <Save size={20} />
                Crear Producto
              </button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

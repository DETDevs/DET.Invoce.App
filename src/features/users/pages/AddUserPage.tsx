import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { ImageUploadField } from "@/shared/ui/ImageUploadField";
import toast from "react-hot-toast";

export const AddUserPage = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Vendedor",
    status: "Activo",
  });

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    imageFile !== null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      toast.error(`El campo ${e.target.name} es obligatorio`, {
        id: e.target.name,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    console.log("Creando usuario:", { ...formData, imageFile });
    toast.success("Usuario creado exitosamente!");
    navigate("/usuarios");
  };

  return (
    <div className="p-6 md:p-8 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/usuarios")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#593D31]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-[#2D2D2D]">Nuevo Usuario</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-8">
              <ImageUploadField
                label="Foto de Perfil"
                onImageSelected={setImageFile}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-8">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Nombre Completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Correo Electrónico <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="usuario@empresa.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Contraseña Temporal <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Rol
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  >
                    <option value="Admin">Administrador</option>
                    <option value="Vendedor">Vendedor</option>
                    <option value="Pastelero">Pastelero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Estado Inicial
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/usuarios")}
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
                Crear Usuario
              </button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

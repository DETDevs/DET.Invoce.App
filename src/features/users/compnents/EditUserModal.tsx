import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { ImageUploadField } from "@/shared/ui/ImageUploadField";
import toast from "react-hot-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  image: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedUser: User) => void;
}

export const EditUserModal = ({
  isOpen,
  onClose,
  user,
  onSave,
}: EditUserModalProps) => {
  const [formData, setFormData] = useState<User | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(user);
      setNewImageFile(null);
    }
  }, [user]);

  if (!isOpen || !formData) return null;

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.role.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (formData) {
      console.log("Actualizando usuario...", { ...formData, newImageFile });
      onSave(formData);
      toast.success("Usuario actualizado correctamente");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-2xl font-bold text-[#593D31]">Editar Usuario</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8">
          <form id="edit-user-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <ImageUploadField
                label="Foto de Perfil"
                currentImage={formData.image}
                onImageSelected={setNewImageFile}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  >
                    <option value="Admin">Administrador</option>
                    <option value="Vendedor">Vendedor</option>
                    <option value="Pastelero">Pastelero</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
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
            form="edit-user-form"
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

import React, { useEffect, useState } from "react";
import { X, Save, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import userApi from "@/api/user/UserAPI";

interface User {
  id: number;
  name: string;
  role: string;
  status: string;
  image: string;
  originalUsername: string;
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
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setNewPassword("");
      setShowPassword(false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.trim() !== "") {
      setIsSubmitting(true);
      try {
        await userApi.changePassword(user.id, newPassword);
        toast.success("Contraseña actualizada correctamente");
        onSave(user);
        onClose();
      } catch (error) {
        toast.error("Hubo un error al cambiar la contraseña");
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Escriba la nueva contraseña"
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8BC6E] text-[#2D2D2D]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-[#E8BC6E] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Dejar en blanco para mantener la contraseña actual.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Rol
                </label>
                <input
                  value={user.role}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                  Estado
                </label>
                <input
                  value={user.status}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
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
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl shadow-md transition-all active:scale-95 ${
              isSubmitting
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-[#E8BC6E] hover:bg-[#dca34b] text-white cursor-pointer"
            }`}
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {newPassword.trim() !== "" ? "Guardar Contraseña" : "Cerrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

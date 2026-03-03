import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const getButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-[#d87c68] hover:bg-[#c05e48] text-white";
      case "warning":
        return "bg-[#E8BC6E] hover:bg-[#dca34b] text-white";
      default:
        return "bg-[#E8BC6E] hover:bg-[#dca34b] text-white";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#593D31] flex items-center gap-2">
            <AlertTriangle
              className={
                variant === "danger" ? "text-[#d87c68]" : "text-[#E8BC6E]"
              }
              size={24}
            />
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 text-lg">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors ${getButtonStyles()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

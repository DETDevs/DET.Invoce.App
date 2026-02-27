import type { ReactNode } from "react";
import { Lock, DoorOpen } from "lucide-react";
import { useCashBox } from "@/features/settings/pages/CashBoxContext";

interface CashBoxGuardProps {
  children: ReactNode;
}

export const CashBoxGuard = ({ children }: CashBoxGuardProps) => {
  const { isCashOpen, triggerOpenModal } = useCashBox();

  if (!isCashOpen) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-[#FDFBF7] p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
            <Lock size={36} className="text-amber-500" />
          </div>

          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-3">
            No hay caja abierta
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Para acceder a esta sección necesitás tener una caja abierta. Abrí
            una nueva caja para continuar.
          </p>

          <button
            onClick={triggerOpenModal}
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#E8BC6E] hover:bg-[#dca34b] text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <DoorOpen size={20} />
            Abrir Caja
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

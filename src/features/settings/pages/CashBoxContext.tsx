import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { logError } from "@/shared/utils/logError";
import { OpenCashBoxModal } from "@/features/settings/components/OpenCashBoxModal";
import { useSettings } from "@/features/settings/hooks/useSettings";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import cashRegisterApi from "@/api/cash-register/CashRegisterAPI";
import type { CashBoxSession } from "@/features/settings/types";
import toast from "react-hot-toast";

interface CashBoxContextType {
  session: CashBoxSession | null;
  isCashOpen: boolean;
  openCashBox: (amount: number) => void;
  closeCashBox: (closingAmount?: number) => Promise<void>;
  triggerOpenModal: () => void;
}

const CashBoxContext = createContext<CashBoxContextType | undefined>(undefined);

const CASH_BOX_STORAGE_KEY = "cash-box-session";

export const CashBoxProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<CashBoxSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { settings } = useSettings();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const checkOpenCashBox = async () => {
      try {
        const response = await cashRegisterApi.getOpen();

        if (response && response.cashRegisterId) {
          const newSession: CashBoxSession = {
            cashRegisterId: response.cashRegisterId,
            initialAmount: response.openingAmount || 0,
            openedAt: response.openingDate || new Date().toISOString(),
            isOpen: true,
          };
          setSession(newSession);
          localStorage.setItem(
            CASH_BOX_STORAGE_KEY,
            JSON.stringify(newSession),
          );
          setIsModalOpen(false);
        } else {
          setIsModalOpen(true);
        }
      } catch (error) {
        logError("[CashBox] Error al consultar caja abierta", error, {
          action: "checkOpenCashBox",
        });
        setIsModalOpen(true);
      }
    };

    checkOpenCashBox();
  }, []);

  const openCashBox = async (amount: number) => {
    try {
      await cashRegisterApi.open({
        openingAmount: amount,
        openedBy: user?.name ?? "Sistema",
      });

      const openResponse = await cashRegisterApi.getOpen();
      const cashRegisterId = openResponse?.cashRegisterId ?? 0;

      const newSession: CashBoxSession = {
        cashRegisterId,
        initialAmount: amount,
        openedAt: new Date().toISOString(),
        isOpen: true,
      };
      localStorage.setItem(CASH_BOX_STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      setIsModalOpen(false);
      toast.success("Caja abierta correctamente");
    } catch (error) {
      logError("[CashBox] Error al abrir caja", error, {
        action: "openCashBox",
      });
      toast.error("No se pudo abrir la caja en el servidor");
    }
  };

  const closeCashBox = async (closingAmount?: number) => {
    if (!session) return;
    try {
      await cashRegisterApi.close(session.cashRegisterId, closingAmount ?? 0);

      localStorage.removeItem(CASH_BOX_STORAGE_KEY);
      setSession(null);
    } catch (error) {
      logError("[CashBox] Error al cerrar caja", error, {
        action: "closeCashBox",
      });
      toast.error("No se pudo cerrar la caja en el servidor");
    }
  };

  const triggerOpenModal = () => {
    setIsModalOpen(true);
  };

  const isCashOpen = session !== null;

  return (
    <CashBoxContext.Provider
      value={{
        session,
        isCashOpen,
        openCashBox,
        closeCashBox,
        triggerOpenModal,
      }}
    >
      {children}
      <OpenCashBoxModal
        isOpen={isModalOpen}
        onSubmit={openCashBox}
        onClose={() => setIsModalOpen(false)}
        defaultAmount={settings.initialCashBox}
      />
    </CashBoxContext.Provider>
  );
};

export const useCashBox = () => {
  const context = useContext(CashBoxContext);
  if (context === undefined) {
    throw new Error("useCashBox debe ser usado dentro de un CashBoxProvider");
  }
  return context;
};

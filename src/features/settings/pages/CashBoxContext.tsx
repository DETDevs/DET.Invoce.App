import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { OpenCashBoxModal } from "../components/OpenCashBoxModal";
import { useSettings } from "../../settings/hooks/useSettings";
import type { CashBoxSession } from "../types";

interface CashBoxContextType {
  session: CashBoxSession | null;
  openCashBox: (amount: number) => void;
}

const CashBoxContext = createContext<CashBoxContextType | undefined>(undefined);

const CASH_BOX_STORAGE_KEY = "cash-box-session";

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const CashBoxProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<CashBoxSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(CASH_BOX_STORAGE_KEY);
      if (storedSession) {
        const parsedSession: CashBoxSession = JSON.parse(storedSession);
        const sessionDate = new Date(parsedSession.openedAt);
        const today = new Date();

        if (isSameDay(sessionDate, today) && parsedSession.isOpen) {
          setSession(parsedSession);
        } else {
          setIsModalOpen(true);
        }
      } else {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error al cargar la sesión de caja:", error);
      setIsModalOpen(true);
    }
  }, []);

  const openCashBox = (amount: number) => {
    const newSession: CashBoxSession = {
      initialAmount: amount,
      openedAt: new Date().toISOString(),
      isOpen: true,
    };
    localStorage.setItem(CASH_BOX_STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
    setIsModalOpen(false);
  };

  return (
    <CashBoxContext.Provider value={{ session, openCashBox }}>
      {children}
      <OpenCashBoxModal
        isOpen={isModalOpen}
        onSubmit={openCashBox}
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
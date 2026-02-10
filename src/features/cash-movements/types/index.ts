export type MovementType = "cash-in" | "cash-out";

export type CashInCategory = "fondo_caja" | "aporte" | "devolucion" | "otro";
export type CashOutCategory = "proveedor" | "gasto" | "retiro" | "otro";
export type MovementCategory = CashInCategory | CashOutCategory;

export interface CashMovement {
    id: string;
    type: MovementType;
    category: MovementCategory;
    amount: number;
    description: string;
    createdBy: string;
    createdAt: string;
    notes?: string;
}

export interface CashSummaryData {
    totalCashIn: number;
    totalCashOut: number;
    balance: number;
    movementsCount: number;
}

export const CASH_IN_CATEGORIES: { value: CashInCategory; label: string }[] = [
    { value: "fondo_caja", label: "Fondo de Caja / Efectivo para Cambio" },
    { value: "aporte", label: "Aporte del Dueño" },
    { value: "devolucion", label: "Devolución" },
    { value: "otro", label: "Otro" },
];

export const CASH_OUT_CATEGORIES: { value: CashOutCategory; label: string }[] = [
    { value: "proveedor", label: "Pago a Proveedor" },
    { value: "gasto", label: "Gasto Operativo" },
    { value: "retiro", label: "Retiro del Dueño" },
    { value: "otro", label: "Otro" },
];

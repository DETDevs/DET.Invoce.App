export type MovementType = "cash-in" | "cash-out";

export interface MovementTypeOption {
    cashMovementTypeId: number;
    name: string;
    flow: "IN" | "OUT";
}

export interface CashMovement {
    id: string;
    type: MovementType;
    cashMovementTypeId: number;
    categoryName: string;
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

export type TCashRegisterOpen = {
    openingAmount: number;
    openedBy: string;
};

export type TCashMovementSave = {
    cashMovementTypeId: number;
    amount: number;
    description: string;
    createdBy: string;
};

export type TGetMovementParams = {
    cashMovementId?: number | null;
    flow?: string | null;
};

export type TGetMovementTypeParams = {
    cashMovementId?: number | null;
};

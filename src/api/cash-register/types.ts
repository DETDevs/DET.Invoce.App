export type TCashRegisterOpen = {
    openingAmount: number;
    openedBy: string;
};

export type TCashMovementSave = {
    cashMovementId?: number;
    cashRegisterId?: number;
    cashMovementTypeId: number;
    amount: number;
    description: string;
    createdBy: string;
    flow: string;
    createdDate?: string;
};

export type TCashMovement = {
    cashMovementId: number;
    cashRegisterId: number;
    cashMovementTypeId: number;
    amount: number;
    description: string;
    createdBy: string;
    flow: string;
    createdDate: string;
};

export type TCashMovementType = {
    cashMovementTypeId: number;
    code: string;
    name: string;
    flow: string;
    isActive: boolean;
};

export type TGetMovementParams = {
    cashMovementId?: number | null;
    flow?: string | null;
    cashRegisterId?: number | null;
};

export type TGetMovementTypeParams = {
    cashMovementTypeId?: number | null;
};

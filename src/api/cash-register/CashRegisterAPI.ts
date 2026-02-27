import api from '../api';
import type {
    TCashRegisterOpen,
    TCashMovementSave,
    TCashMovement,
    TCashMovementType,
    TGetMovementParams,
} from './types';

async function open(data: TCashRegisterOpen) {
    return api.post<any>('/CashRegister/Open', data);
}

async function saveMovement(data: TCashMovementSave) {
    return api.post<any>('/CashRegister/SaveMovement', data);
}

async function getTotal() {
    return api.get<number>('/CashRegister/GetTotal');
}

async function getMovement(params: TGetMovementParams = {}) {
    return api.post<TCashMovement[]>('/CashRegister/GetMovement', {
        cashMovementId: params.cashMovementId ?? null,
        flow: params.flow ?? null,
    });
}

async function getMovementType() {
    return api.get<TCashMovementType[]>('/CashRegister/GetMovementType');
}

async function getSummary(params: { dateFrom?: string; dateTo?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.dateFrom) qs.append('dateFrom', params.dateFrom);
    if (params.dateTo) qs.append('dateTo', params.dateTo);
    return api.get<any>(`/CashRegister/GetSummary?${qs.toString()}`);
}

async function closeCashRegister(data: { initialAmount?: number; expectedAmount?: number; finalAmount: number; closedBy: string; notes?: string }) {
    return api.post<any>('/CashRegister/Close', data);
}

async function getOpen() {
    return api.get<any>('/CashRegister/GetOpen');
}

const cashRegisterApi = {
    open,
    saveMovement,
    getTotal,
    getMovement,
    getMovementType,
    getSummary,
    close: closeCashRegister,
    getOpen,
};

export default cashRegisterApi;

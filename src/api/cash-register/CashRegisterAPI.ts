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

const cashRegisterApi = {
    open,
    saveMovement,
    getTotal,
    getMovement,
    getMovementType,
};

export default cashRegisterApi;

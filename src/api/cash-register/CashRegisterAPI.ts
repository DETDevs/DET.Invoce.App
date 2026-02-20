import api from '../api';
import type {
    TCashRegisterOpen,
    TCashMovementSave,
    TGetMovementParams,
    TGetMovementTypeParams,
} from './types';

async function open(data: TCashRegisterOpen) {
    return api.post<any>('/CashRegister/Open', data);
}

async function saveMovement(data: TCashMovementSave) {
    return api.post<any>('/CashRegister/SaveMovement', data);
}

async function getTotal() {
    return api.get<any>('/CashRegister/GetTotal');
}

async function getMovement(params: TGetMovementParams = {}) {
    return api.getWithBody<any>('/CashRegister/GetMovement', params);
}

async function getMovementType(params: TGetMovementTypeParams = {}) {
    return api.getWithBody<any>('/CashRegister/GetMovementType', params);
}

const cashRegisterApi = {
    open,
    saveMovement,
    getTotal,
    getMovement,
    getMovementType,
};

export default cashRegisterApi;

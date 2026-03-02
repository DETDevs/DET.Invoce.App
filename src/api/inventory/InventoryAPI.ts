import api from '../api';
import type { TInventorySave, TInventoryOutput, TValidateAvailability } from './types';

export interface TAvailabilityResponse {
    isAvailable: boolean;
    available: number;
    requested: number;
    trackInventory: boolean;
    message: string;
}

async function save(data: TInventorySave) {
    return api.post<any>('/Inventory/Save', data);
}

async function output(data: TInventoryOutput) {
    return api.post<any>('/Inventory/Output', data);
}

async function validateAvailability(data: TValidateAvailability): Promise<TAvailabilityResponse> {
    try {
        const response = await api.post<TAvailabilityResponse>('/Inventory/ValidateAvailability', data);
        return response;
    } catch {
        return { isAvailable: true, available: 0, requested: data.quantity, trackInventory: false, message: '' };
    }
}

const inventoryApi = {
    save,
    output,
    validateAvailability,
};

export default inventoryApi;


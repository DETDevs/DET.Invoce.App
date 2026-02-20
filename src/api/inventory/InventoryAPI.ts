import api from '../api';
import type { TInventorySave, TInventoryOutput } from './types';

async function save(data: TInventorySave) {
    return api.post<any>('/Inventory/Save', data);
}

async function output(data: TInventoryOutput) {
    return api.post<any>('/Inventory/Output', data);
}

const inventoryApi = {
    save,
    output,
};

export default inventoryApi;

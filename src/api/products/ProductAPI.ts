import api from '../api';
import type { TProduct, TSaveProduct } from './types';

const enc = (v: string | number) => encodeURIComponent(String(v ?? ''));

async function getByCode(code?: string) {
    const params = code ? `?code=${enc(code)}` : '';
    return api.get<TProduct[]>(`/Product/GetByCode${params}`);
}

async function save(product: TSaveProduct, imageFile?: File | null) {
    const formData = new FormData();
    formData.append('ProductJson', JSON.stringify(product));
    if (imageFile) {
        formData.append('Image', imageFile);
    }
    return api.postFormData<any>('/Product/Save', formData);
}

async function getLowStock() {
    return api.post<TProduct[]>('/Product/GetLowStock', {});
}

async function getProductMovements(productId: number, dateFrom?: string, dateTo?: string) {
    const qs = new URLSearchParams();
    qs.append('productId', String(productId));
    if (dateFrom) qs.append('dateFrom', dateFrom);
    if (dateTo) qs.append('dateTo', dateTo);
    return api.get<any[]>(`/Product/GetProductMovements?${qs.toString()}`);
}

async function getByOrder() {
    return api.get<TProduct[]>('/Product/GetByOrder');
}

const productApi = {
    getByCode,
    getByOrder,
    save,
    getLowStock,
    getProductMovements,
};

export default productApi;

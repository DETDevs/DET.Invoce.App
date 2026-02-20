import api from '../api';
import type { TProduct, TSaveProduct } from './types';

const enc = (v: string | number) => encodeURIComponent(String(v ?? ''));

async function getByCode(code?: string) {
    const params = code ? `?code=${enc(code)}` : '';
    return api.get<TProduct[]>(`/Product/GetByCode${params}`);
}

async function save(product: TSaveProduct) {
    return api.post<any>('/Product/Save', product);
}

async function getLowStock() {
    return api.post<TProduct[]>('/Product/GetLowStock', {});
}

const productApi = {
    getByCode,
    save,
    getLowStock,
};

export default productApi;

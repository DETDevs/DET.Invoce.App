import api from '../api';
import type { Product } from './types';


class ProductAPI {
    private readonly baseEndpoint = '/Product';

    async getAll(): Promise<Product[]> {
        const response = await api.get<Product[]>(`${this.baseEndpoint}/GetByCode`);
        return response;
    }
    async getByCode(code: string): Promise<Product> {
        const response = await api.get<Product>(
            `${this.baseEndpoint}/GetByCode?code=${encodeURIComponent(code)}`
        );
        return response;
    }
    async create(product: Partial<Product>): Promise<Product> {
        const response = await api.post<Product>(`${this.baseEndpoint}/Create`, product);
        return response;
    }

    async update(code: string, product: Partial<Product>): Promise<Product> {
        const response = await api.put<Product>(
            `${this.baseEndpoint}/Update?code=${encodeURIComponent(code)}`,
            product
        );
        return response;
    }
    async delete(code: string): Promise<void> {
        await api.delete(`${this.baseEndpoint}/Delete?code=${encodeURIComponent(code)}`);
    }
}

export const productAPI = new ProductAPI();
export default productAPI;

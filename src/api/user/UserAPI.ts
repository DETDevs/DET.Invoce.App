import api from '../api';
import type { TUser, TUserCreate } from './types';

async function create(data: TUserCreate) {
    return api.post<any>('/User/Create', data);
}

async function changePassword(userId: number, newPassword: string) {
    return api.post<any>(`/User/ChangePassword?userId=${userId}&newPassword=${newPassword}`, {});
}

async function getByUsername(username: string) {
    return api.get<any>(`/User/GetByUsername?username=${username}`);
}

async function getAll() {
    return api.get<TUser[]>('/User/GetAll');
}

const userApi = {
    create,
    changePassword,
    getByUsername,
    getAll,
};

export default userApi;

import api from "../api";

export interface TLoginRequest {
    username: string;
    password: string;
}

export const authApi = {
    authenticate: async (data: TLoginRequest): Promise<string> => {
        return api.postText("/Authentication/Authenticate", data);
    },
};

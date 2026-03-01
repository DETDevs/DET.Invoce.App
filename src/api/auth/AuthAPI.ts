import api from "../api";

export interface TLoginRequest {
    username: string;
    password: string;
}

export interface TAuthResponse {
    userId: number | null;
    username: string;
    passwordHash: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string;
    isActive: boolean;
    token: string;
    refreshToken: string;
}

export const authApi = {
    authenticate: async (data: TLoginRequest): Promise<TAuthResponse> => {
        return api.post<TAuthResponse>("/Authentication/Authenticate", data);
    },

    refreshToken: async (refreshToken: string): Promise<TAuthResponse> => {
        return api.post<TAuthResponse>(
            `/Authentication/RefreshToken?refreshToken=${encodeURIComponent(refreshToken)}`
        );
    },
};

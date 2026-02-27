export type TUser = {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
};

export type TUserCreate = {
    username: string;
    passwordHash: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
};

export type TUserChangePassword = {
    userId: number;
    newPassword: string;
};

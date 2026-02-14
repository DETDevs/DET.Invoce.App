export type UserRole = 'admin' | 'cajero' | 'mesero';

export interface MockUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar?: string;
}

export const MOCK_USERS: MockUser[] = [
    {
        id: 'usr-001',
        name: 'Administrador',
        email: 'admin@dulcesmomentos.com',
        password: 'Admin@123',
        role: 'admin',
    },
    {
        id: 'usr-002',
        name: 'Carlos (Cajero)',
        email: 'carlos@dulcesmomentos.com',
        password: 'Cajero@123',
        role: 'cajero',
    },
    {
        id: 'usr-003',
        name: 'Ana (Mesera)',
        email: 'ana@dulcesmomentos.com',
        password: 'Mesero@123',
        role: 'mesero',
    },
    {
        id: 'usr-004',
        name: 'Luis (Mesero)',
        email: 'luis@dulcesmomentos.com',
        password: 'Mesero@456',
        role: 'mesero',
    },
];

export const findUserByPassword = (password: string): MockUser | null => {
    return MOCK_USERS.find((u) => u.password === password) || null;
};

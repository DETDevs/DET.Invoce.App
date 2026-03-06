
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[*@#$!%^&]).{8,}$/;

    return passwordRegex.test(password);
};

export const getPasswordError = (password: string): string | null => {
    if (!/(?=.*[a-z])/.test(password)) return "Falta una letra minúscula";
    if (!/(?=.*[A-Z])/.test(password)) return "Falta una letra mayúscula";
    if (!/(?=.*\d)/.test(password)) return "Falta un número";
    if (!/(?=.*[*@#$!%^&])/.test(password)) return "Falta un carácter especial (*@#$!%^&)";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";

    return null;
};
const SETTINGS_STORAGE_KEY = "app-settings";

export function getCurrencySymbol(): string {
    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            const settings = JSON.parse(stored);
            if (settings.mainCurrency === "USD") return "$";
        }
    } catch {
        
    }
    return "C$";
}

export function formatCurrency(amount: number): string {
    const symbol = getCurrencySymbol();
    return `${symbol} ${amount.toFixed(2)}`;
}

export { getCurrencySymbol as currencySymbol };

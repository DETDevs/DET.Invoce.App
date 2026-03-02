const SETTINGS_STORAGE_KEY = "app-settings";

/**
 * Returns the currency symbol based on the mainCurrency stored in settings.
 * Reads from localStorage to avoid requiring React context.
 */
export function getCurrencySymbol(): string {
    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            const settings = JSON.parse(stored);
            if (settings.mainCurrency === "USD") return "$";
        }
    } catch {
        // fallback
    }
    return "C$";
}

/**
 * Formats a number as a currency string using the configured main currency.
 * @example formatCurrency(420) => "C$ 420.00"
 */
export function formatCurrency(amount: number): string {
    const symbol = getCurrencySymbol();
    return `${symbol} ${amount.toFixed(2)}`;
}

/**
 * Returns just the currency symbol prefix (e.g. "C$" or "$") for use in input labels.
 */
export { getCurrencySymbol as currencySymbol };

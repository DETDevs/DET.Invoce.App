import type { Invoice } from "@/features/invoices/types";

const INVOICES_STORAGE_KEY = "invoices";

export const loadInvoices = (): Invoice[] => {
    try {
        const stored = localStorage.getItem(INVOICES_STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as Invoice[];
    } catch (error) {
        console.error("Error loading invoices from localStorage", error);
        return [];
    }
};

export const saveInvoices = (invoices: Invoice[]): void => {
    try {
        localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    } catch (error) {
        console.error("Error saving invoices to localStorage", error);
    }
};

export const addInvoice = (invoice: Invoice): void => {
    const invoices = loadInvoices();
    invoices.unshift(invoice); // Add to beginning
    saveInvoices(invoices);
};

export const updateInvoice = (id: string, updates: Partial<Invoice>): void => {
    const invoices = loadInvoices();
    const index = invoices.findIndex((inv) => inv.id === id);
    if (index !== -1) {
        invoices[index] = { ...invoices[index], ...updates };
        saveInvoices(invoices);
    }
};

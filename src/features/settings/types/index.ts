export interface Settings {
  currencyId?: number;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  taxId: string;
  initialCashBox: number;
  mainCurrency: 'NIO' | 'USD';
  dollarExchangeRate: number;
  tableCount: number;
}

export interface CashBoxSession {
  cashRegisterId: number;
  initialAmount: number;
  openedAt: string;
  isOpen: boolean;
}
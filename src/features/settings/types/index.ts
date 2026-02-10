export interface Settings {
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  taxId: string;
  initialCashBox: number;
  mainCurrency: 'NIO' | 'USD';
  dollarExchangeRate: number;
}

export interface CashBoxSession {
  initialAmount: number;
  openedAt: string;
  isOpen: boolean;
}
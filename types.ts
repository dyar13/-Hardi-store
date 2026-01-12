export type Currency = 'USD' | 'IQD';

export type Language = 'en' | 'ku';

export type DebtType = 'we_owe' | 'owed_to_us';
export type DebtStatus = 'unpaid' | 'partial' | 'paid';

export type StoreType = 'clothes' | 'shoes';
export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'green' | 'blue' | 'rose';

export interface Sale {
  id: string;
  code: string;
  date: string;
  amount: number;
  currency: Currency;
  note?: string;
  store: StoreType; // Data separation
  timestamp: number;
}

export interface Purchase {
  id: string;
  date: string;
  productName: string;
  quantity: number;
  totalCost: number;
  currency: Currency;
  store: StoreType; // Data separation
  timestamp: number;
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  note?: string;
}

export interface Debt {
  id: string;
  code: string;
  type: DebtType;
  personName: string;
  phone?: string;
  totalAmount: number;
  currency: Currency;
  createdDate: string;
  dueDate?: string;
  status: DebtStatus;
  payments: DebtPayment[];
  note?: string;
  store: StoreType; // Data separation
  timestamp: number;
}

export interface AppData {
  sales: Sale[];
  purchases: Purchase[];
  debts: Debt[];
}

export type Tab = 'dashboard' | 'sales' | 'inventory' | 'debts' | 'settings';
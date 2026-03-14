export type TransactionType = 'payment' | 'deposit' | 'withdraw' | 'transfer';

export type Transaction = {
  id: string;
  accountId: string;
  type: TransactionType;
  value: number;
  date: string;
  category?: string;
  description?: string;
  from?: string;
  to?: string;
  urlAnexo?: string;
  createdAt?: string;
};

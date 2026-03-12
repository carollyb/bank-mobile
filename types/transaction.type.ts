export type Transaction = {
  id: string;
  accountId: string;
  type: 'payment' | 'deposit' | 'withdraw' | 'transfer';
  value: number;
  date: string;
  anexo?: any;
  from?: string;
  to?: string;
  urlAnexo?: string;
};

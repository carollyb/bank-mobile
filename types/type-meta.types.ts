import { Transaction } from './transaction.type';

export const TYPE_META: Record<
  Transaction['type'],
  { label: string; icon: string; color: string }
> = {
  deposit: { label: 'Depósito', icon: '↓', color: '#2da12b' },
  withdraw: { label: 'Saque', icon: '↑', color: '#E53935' },
  transfer: { label: 'Transferência', icon: '⇄', color: '#E53935' },
  payment: { label: 'Boleto', icon: '📄', color: '#E53935' },
};

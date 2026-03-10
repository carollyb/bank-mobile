export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertState {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
}

export const initialAlertState: AlertState = {
  visible: false,
  type: 'info',
  title: '',
  message: '',
};

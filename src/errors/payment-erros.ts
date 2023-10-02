import { ApplicationError } from '@/protocols';

export function paymentErrors(): ApplicationError {
  return {
    name: 'PaymentError',
    message: 'Payment Required',
  };
}

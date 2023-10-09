import { ApplicationError } from '@/protocols';

export function paymentErrors(): ApplicationError {
  return {
    name: 'PaymentErrors',
    message: 'Payment Required',
  };
}

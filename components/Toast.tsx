import { CheckIcon } from '@/components/icons';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  return (
    <div className="toast">
      <CheckIcon />
      {message}
    </div>
  );
}

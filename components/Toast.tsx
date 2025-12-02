import CheckIcon from '@/components/icons/CheckIcon';

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="toast">
      <CheckIcon />
      {message}
    </div>
  );
}

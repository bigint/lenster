import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

interface RadioProps {
  title?: string;
  message?: ReactNode;
  className?: string;
  name: string;
  onChange?: () => void;
}

export const Radio: FC<RadioProps> = ({
  title,
  message,
  className = '',
  name,
  onChange
}) => {
  if (!message) {
    return null;
  }

  return (
    <div className={clsx('flex items-center space-x-2 p-2', className)}>
      <input
        type="radio"
        name={name}
        className="text-brand dark:text-brand h-4 w-4 border focus:ring-0 focus:ring-offset-0"
        onChange={onChange}
      />
      <div>
        <h3 className="text-base font-medium">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="text-sm">{message}</div>
        </div>
      </div>
    </div>
  );
};

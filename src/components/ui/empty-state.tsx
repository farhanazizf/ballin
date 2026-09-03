import { cn } from '@/lib/utils';
import { Button } from './button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  theme?: 'field' | 'report';
  className?: string;
}

export function EmptyState({ icon, title, description, action, theme = 'report', className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center',
      className
    )}>
      <div className={cn(
        'w-14 h-14 rounded-2xl flex items-center justify-center mb-5',
        theme === 'field' 
          ? 'bg-[var(--color-field-surface)] text-[var(--color-field-text-3)]' 
          : 'bg-[var(--color-report-bg)] text-[var(--color-report-text-3)]'
      )}>
        {icon}
      </div>
      <h3 className={cn(
        'font-[family-name:var(--font-display)] text-lg font-semibold mb-2',
        theme === 'field' ? 'text-[var(--color-field-text)]' : 'text-[var(--color-report-text)]'
      )}>
        {title}
      </h3>
      <p className={cn(
        'font-[family-name:var(--font-ui)] text-sm max-w-[320px] leading-relaxed',
        theme === 'field' ? 'text-[var(--color-field-text-3)]' : 'text-[var(--color-report-text-3)]'
      )}>
        {description}
      </p>
      {action && (
        <Button
          variant={theme === 'field' ? 'primary' : 'report-primary'}
          size="md"
          className="mt-6"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

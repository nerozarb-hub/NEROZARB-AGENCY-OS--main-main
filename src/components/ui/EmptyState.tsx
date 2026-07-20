import { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** A consistent first-run state that tells an operator exactly what to do next. */
export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <section className="empty-state" aria-live="polite">
      <div className="empty-state-icon" aria-hidden="true">{icon}</div>
      <div className="max-w-md space-y-2">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="text-sm leading-6 text-text-muted">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2 min-h-11 px-5 normal-case text-sm tracking-normal">
          {actionLabel}
        </Button>
      )}
    </section>
  );
}

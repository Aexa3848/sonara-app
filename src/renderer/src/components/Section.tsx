import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({ title, description, action, children }: Props) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-h2 text-fg gradient-text">{title}</h2>
          {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

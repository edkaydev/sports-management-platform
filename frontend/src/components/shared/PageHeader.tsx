import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, action, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {(actions || action) && <div className="flex gap-2">{actions ?? action}</div>}
    </div>
  );
}

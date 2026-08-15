import type { ReactNode } from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
  className = '',
  onClick,
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const base =
    'inline-flex items-center justify-center rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-danger text-white hover:bg-red-700',
  };
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2',
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-surface border border-border rounded-lg p-5 ${className}`}>{children}</div>;
}

export function Badge({ color = 'gray', children }: { color?: 'green' | 'red' | 'amber' | 'blue' | 'gray'; children: ReactNode }) {
  const colors = {
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}

export function statusColor(status?: string): 'green' | 'red' | 'amber' | 'blue' | 'gray' {
  const s = (status ?? '').toUpperCase();
  if (['ACTIVE', 'GOOD_STANDING', 'COMPLETED', 'PRESENT', 'PASS'].some((k) => s.includes(k))) return 'green';
  if (['EXPIRED', 'REVOKED', 'SUSPENDED', 'CANCELLED', 'FAIL', 'ABSENT', 'REJECTED'].some((k) => s.includes(k))) return 'red';
  if (['WARNING', 'PROBATION', 'PENDING', 'IN_PROGRESS', 'EXPIRING'].some((k) => s.includes(k))) return 'amber';
  if (['PLANNED', 'SCHEDULED', 'INFO'].some((k) => s.includes(k))) return 'blue';
  return 'gray';
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="py-10 text-center text-sm text-muted">
      <p>{message}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}

export function InlineAlert({
  type = 'info',
  message,
}: {
  type?: 'info' | 'warning' | 'error' | 'success';
  message: string;
}) {
  const colors = {
    info: 'border-blue-400 text-blue-800',
    warning: 'border-amber-400 text-amber-800',
    error: 'border-red-400 text-red-800',
    success: 'border-green-400 text-green-800',
  };
  return (
    <div className={`border-l-4 bg-surface px-4 py-3 text-sm ${colors[type]}`}>{message}</div>
  );
}

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export const inputClass =
  'w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary';

export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-y border-border">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

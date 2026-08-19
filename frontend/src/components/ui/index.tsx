import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Table as TableBase,
  TableHeader as TableHeaderBase,
  TableBody as TableBodyBase,
  TableRow as TableRowBase,
  TableHead as TableHeadBase,
  TableCell as TableCellBase,
} from './table';

export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Badge, badgeVariants } from './badge';
export { Input } from './input';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './dialog';
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './select';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Progress } from './progress';
export { Skeleton } from './skeleton';
export { Checkbox } from './checkbox';

function TableCompat({
  headers,
  children,
  className,
}: {
  headers?: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableBase className={cn('w-full text-sm', className)}>
      {headers && (
        <TableHeaderBase>
          <TableRowBase className="bg-gray-50 border-y border-border">
            {headers.map((h) => (
              <TableHeadBase key={h} className="px-4 py-2.5 text-left font-medium text-gray-600 whitespace-nowrap">
                {h}
              </TableHeadBase>
            ))}
          </TableRowBase>
        </TableHeaderBase>
      )}
      <TableBodyBase className="divide-y divide-border">{children}</TableBodyBase>
    </TableBase>
  );
}

export { TableCompat as Table, TableHeaderBase as TableHeader, TableBodyBase as TableBody, TableRowBase as TableRow, TableHeadBase as TableHead, TableCellBase as TableCell };

export function PageHeader({
  title,
  subtitle,
  actions,
  action,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {(actions || action) && <div className="flex gap-2">{actions ?? action}</div>}
    </div>
  );
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
    <div className="py-10 text-center text-sm text-muted-foreground">
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
    info: 'border-blue-400 text-blue-800 bg-blue-50',
    warning: 'border-amber-400 text-amber-800 bg-amber-50',
    error: 'border-red-400 text-red-800 bg-red-50',
    success: 'border-green-400 text-green-800 bg-green-50',
  };
  return (
    <div className={`border-l-4 px-4 py-3 text-sm rounded-r-lg ${colors[type]}`}>{message}</div>
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
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export function statusColor(status?: string): 'green' | 'red' | 'amber' | 'blue' | 'gray' {
  const s = (status ?? '').toUpperCase();
  if (['ACTIVE', 'GOOD_STANDING', 'COMPLETED', 'PRESENT', 'PASS'].some((k) => s.includes(k))) return 'green';
  if (['EXPIRED', 'REVOKED', 'SUSPENDED', 'CANCELLED', 'FAIL', 'ABSENT', 'REJECTED'].some((k) => s.includes(k))) return 'red';
  if (['WARNING', 'PROBATION', 'PENDING', 'IN_PROGRESS', 'EXPIRING'].some((k) => s.includes(k))) return 'amber';
  if (['PLANNED', 'SCHEDULED', 'INFO'].some((k) => s.includes(k))) return 'blue';
  return 'gray';
}

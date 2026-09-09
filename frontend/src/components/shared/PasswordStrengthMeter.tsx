import { cn } from '@/lib/utils';

export interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
];

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 0;
  return PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length as PasswordStrength;
}

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  0: '',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  0: 'bg-gray-200',
  1: 'bg-red-500',
  2: 'bg-orange-400',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
};

const STRENGTH_TEXT_COLORS: Record<PasswordStrength, string> = {
  0: 'text-on-surface-variant',
  1: 'text-red-600',
  2: 'text-orange-500',
  3: 'text-yellow-600',
  4: 'text-green-600',
};

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password);
  const label = STRENGTH_LABELS[strength];

  return (
    <div className={cn('mt-2', className)}>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4].map((segment) => (
          <div
            key={segment}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-200',
              segment <= strength ? STRENGTH_COLORS[strength] : 'bg-on-surface/10'
            )}
          />
        ))}
        <span className={cn('ml-2 text-xs font-medium', STRENGTH_TEXT_COLORS[strength] ?? 'text-on-surface-variant')}>
          {label}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {PASSWORD_REQUIREMENTS.map((req) => {
          const pass = req.test(password);
          return (
            <li
              key={req.label}
              className={cn(
                'flex items-center gap-1.5 text-[12px] transition-colors',
                pass ? 'text-green-600' : 'text-on-surface-variant/70'
              )}
            >
              <span className={cn('inline-block h-1.5 w-1.5 rounded-full', pass ? 'bg-green-500' : 'bg-on-surface/25')} />
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
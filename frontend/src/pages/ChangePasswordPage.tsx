import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isForced = user?.mustChangePassword === true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.next !== form.confirm) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (form.next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (form.next === form.current) {
      setError('New password must be different from your current password.');
      return;
    }

    setSubmitting(true);
    try {
      if (isForced) {
        // Uses force-change-password endpoint which clears mustChangePassword
        await authService.forceChangePassword(form.current, form.next);
      } else {
        await authService.changePassword(form.current, form.next);
      }

      toast.success('Password changed successfully. Please log in again.');

      // Sign out — the session tokens were revoked server-side
      await logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? err?.message ?? 'Password change failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function toggle(field: 'current' | 'next' | 'confirm') {
    setShow((s) => ({ ...s, [field]: !s[field] }));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-xl border-0">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-umu-red rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {isForced ? 'Set Your Password' : 'Change Password'}
            </h1>
            {isForced && (
              <p className="text-sm text-gray-500 mt-1 text-center">
                Your account requires you to set a new password before continuing.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={show.current ? 'text' : 'password'}
                  value={form.current}
                  onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => toggle('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={show.current ? 'Hide' : 'Show'}
                >
                  {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={show.next ? 'text' : 'password'}
                  value={form.next}
                  onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => toggle('next')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={show.next ? 'Hide' : 'Show'}
                >
                  {show.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={show.confirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => toggle('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={show.confirm ? 'Hide' : 'Show'}
                >
                  {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3" role="alert">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-umu-red hover:bg-umu-red-dark text-white"
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating…</>
              ) : (
                'Update Password'
              )}
            </Button>

            {!isForced && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-1"
              >
                Cancel
              </button>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}

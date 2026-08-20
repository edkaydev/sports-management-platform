import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_HOME } from '@/lib/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(ROLE_HOME[loggedInUser.role] ?? '/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      if (msg.toLowerCase().includes('suspended')) {
        setError('Your account has been suspended. Please contact your administrator.');
      } else if (msg.toLowerCase().includes('invalid')) {
        setError('Incorrect email or password. Please check your credentials.');
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-umu-red/[0.04] blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-8%] h-[500px] w-[500px] rounded-full bg-umu-red/[0.06] blur-3xl" />
        <div className="absolute top-[20%] right-[15%] h-[300px] w-[300px] rounded-full bg-blue-500/[0.03] blur-3xl" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #DADCE0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="w-full max-w-[440px] px-5 animate-slide-up">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-on-surface transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="rounded-m3-xl border border-outline-variant/60 bg-white/70 backdrop-blur-2xl p-8 sm:p-10 shadow-m3-2">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-umu-red-light mb-4 shadow-sm">
              <Trophy className="w-7 h-7 text-umu-red" />
            </div>
            <h1 className="text-[26px] font-semibold text-on-surface tracking-tight">Welcome back</h1>
            <p className="text-[14px] text-on-surface-variant mt-1.5">Sign in to your UMU Sports account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Login form">
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-medium text-on-surface mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" aria-hidden="true" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@umu.ac.ug"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-11 rounded-full border-outline bg-white/80 text-[14px] focus:bg-white transition-colors"
                  autoComplete="username"
                  required
                  aria-required="true"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[13px] font-medium text-on-surface mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" aria-hidden="true" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-11 rounded-full border-outline bg-white/80 text-[14px] focus:bg-white transition-colors"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition p-1 rounded-full hover:bg-surface-container"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-m3-sm bg-umu-red-light border border-red-100 px-4 py-3 animate-fade-in" role="alert">
                <p className="text-[13px] text-umu-red font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-full bg-umu-red text-white text-[14px] font-medium transition-all shadow-m3-1 hover:bg-umu-red-dark hover:shadow-m3-2 active:scale-[0.98]"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-[12px] text-on-surface-variant">
          Uganda Martyrs University &mdash; Sports Management System
        </p>
      </div>
    </div>
  );
}

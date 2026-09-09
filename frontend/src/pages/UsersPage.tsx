import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, KeyRound, UserX, UserCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { userService, type CreateUserInput } from '@/lib/services/user.service';
import { getErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { User, UserRole } from '@/types';
import { ROLE_LABELS, ROLE_BADGE_COLORS_LIGHT } from '@/lib/constants';
import {
  PageHeader,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Spinner,
  EmptyState,
  Field,
  inputClass,
  InlineAlert,
} from '@/components/ui';
import { FormDialog, ConfirmDialog } from '@/components/shared/FormDialog';
import { PasswordStrengthMeter } from '@/components/shared/PasswordStrengthMeter';

const EMPTY_FORM = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  role: 'SPORTS_REP' as UserRole,
};

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState('');

  const [removeTarget, setRemoveTarget] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.list(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

  const save = useMutation({
    mutationFn: async () => {
      const payload: CreateUserInput = {
        username: form.username.trim(),
        fullName: form.fullName.trim(),
        password: form.password,
        role: form.role,
        email: form.email.trim() || undefined,
      };
      if (editing) {
        await userService.update(editing.id, {
          fullName: form.fullName.trim(),
          role: form.role,
        });
      } else {
        await userService.create(payload);
      }
    },
    onSuccess: () => {
      invalidate();
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setError('');
      setShowPassword(false);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const reset = useMutation({
    mutationFn: async () => {
      if (!resetTarget) return;
      await userService.resetPassword(resetTarget.id, resetPassword);
    },
    onSuccess: () => {
      invalidate();
      setResetTarget(null);
      setResetPassword('');
      setResetError('');
      setShowResetPassword(false);
    },
    onError: (err) => setResetError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => userService.remove(id),
    onSuccess: () => {
      invalidate();
      setRemoveTarget(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: async (u: User) => userService.update(u.id, { isActive: !u.isActive }),
    onSuccess: () => invalidate(),
    onError: (err) => setError(getErrorMessage(err)),
  });

  function startAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setError('');
    setShowForm(true);
  }

  function startEdit(u: User) {
    setEditing(u);
    setForm({ username: u.username, fullName: u.fullName, email: u.email ?? '', password: '', role: u.role });
    setShowPassword(false);
    setError('');
    setShowForm(true);
  }

  const list = users ?? [];

  return (
    <div>
      <PageHeader
        title="User Accounts"
        actions={
          <Button onClick={startAdd}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add User
          </Button>
        }
      />

      {showForm && (
        <FormDialog
          open={showForm}
          onOpenChange={(open) => {
            if (!open) {
              setShowForm(false);
              setEditing(null);
            }
          }}
          title={editing ? `Edit ${editing.fullName}` : 'Add User'}
          description={
            editing
              ? 'Edit name and role. Reset the password from the users table.'
              : 'New users must set their own password on first sign in.'
          }
          isSubmitting={save.isPending}
          onSubmit={() => save.mutate()}
          submitLabel={editing ? 'Save Changes' : 'Create User'}
        >
          {error && <InlineAlert type="error" message={error} />}
          <Field label="Full name" required>
            <input
              className={inputClass}
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              placeholder="e.g. John Ssebunya"
              required
            />
          </Field>
          <Field label="Username" required>
            <input
              className={inputClass}
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="e.g. j.ssebunya"
              disabled={!!editing}
              required
              minLength={3}
            />
          </Field>
          <Field label="Email (optional)">
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="you@umu.ac.ug"
            />
          </Field>
          <Field label="Role" required>
            <select
              className={inputClass}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            >
              <option value="TUTOR">Sports Tutor (full access)</option>
              <option value="SPORTS_REP">Sports Representative</option>
            </select>
          </Field>
          {!editing && (
            <Field label="Temporary password" required>
              <div className="relative">
                <input
                  className={inputClass}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 chars with uppercase, lowercase and number"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthMeter password={form.password} />
            </Field>
          )}
          {editing && (
            <p className="text-sm text-gray-500">
              To force a new password for this user, use “Reset Password” in the table.
            </p>
          )}
        </FormDialog>
      )}

      <FormDialog
        open={!!resetTarget}
        onOpenChange={(open) => {
          if (!open) {
            setResetTarget(null);
            setResetPassword('');
            setResetError('');
          }
        }}
        title={resetTarget ? `Reset password for ${resetTarget.fullName}` : 'Reset password'}
        description="The user will be forced to set a new password on their next sign in."
        isSubmitting={reset.isPending}
        onSubmit={() => reset.mutate()}
        submitLabel="Reset Password"
      >
        {resetError && <InlineAlert type="error" message={resetError} />}
        <Field label="New temporary password" required>
          <div className="relative">
            <input
              className={inputClass}
              type={showResetPassword ? 'text' : 'password'}
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              placeholder="Min 8 chars with uppercase, lowercase and number"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowResetPassword(!showResetPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showResetPassword ? 'Hide password' : 'Show password'}
            >
              {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrengthMeter password={resetPassword} />
        </Field>
      </FormDialog>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title="Remove user?"
        description={
          removeTarget
            ? `${removeTarget.fullName} (${removeTarget.username}) will be deactivated and can no longer sign in. This is reversible.`
            : ''
        }
        confirmLabel="Remove User"
        isConfirming={remove.isPending}
        onConfirm={() => removeTarget && remove.mutate(removeTarget.id)}
      />

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner />
        </div>
      ) : list.length === 0 ? (
        <EmptyState message="No users yet. Add your first user account." />
      ) : (
        <div className="rounded-xl border border-outline-variant/60 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last sign in</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.fullName}
                    {currentUser?.id === u.id && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                  </TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell className="text-gray-500">{u.email ?? '—'}</TableCell>
                  <TableCell>
                    <Badge className={ROLE_BADGE_COLORS_LIGHT[u.role]}>{ROLE_LABELS[u.role] ?? u.role}</Badge>
                    {u.mustChangePassword && (
                      <span className="ml-1.5 text-xs text-amber-600" title="Must change password on next sign in">
                        ●
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(u)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setResetTarget(u)} title="Reset password">
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive.mutate(u)}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                        disabled={currentUser?.id === u.id}
                      >
                        {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setRemoveTarget(u)}
                        disabled={currentUser?.id === u.id}
                        title="Remove user"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {save.isPending || reset.isPending || remove.isPending ? (
        <span className="sr-only">
          <Loader2 className="animate-spin" />
        </span>
      ) : null}
    </div>
  );
}
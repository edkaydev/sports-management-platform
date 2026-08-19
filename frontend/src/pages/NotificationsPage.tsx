import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Megaphone, Mail } from 'lucide-react';
import api, { isTutorRole } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/lib/services/notification.service';
import { PageHeader, Spinner, EmptyState, Button, statusColor, Badge, Card, Field, inputClass, InlineAlert } from '@/components/ui';

// ─── Broadcast form ────────────────────────────────────────────────────────────

function BroadcastPanel() {
  const [tab, setTab] = useState<'broadcast' | 'email'>('broadcast');
  const [bForm, setBForm] = useState({ title: '', message: '', targetRole: '' });
  const [eForm, setEForm] = useState({ subject: '', body: '', recipientRole: '', recipientEmails: '' });
  const [error, setError] = useState('');

  const broadcastMut = useMutation({
    mutationFn: () =>
      notificationService.broadcast({
        title: bForm.title,
        message: bForm.message,
        targetRole: bForm.targetRole || undefined,
      }),
    onSuccess: (data: any) => {
      toast.success(`Broadcast sent to ${data?.recipientCount ?? 'all'} user(s)`);
      setBForm({ title: '', message: '', targetRole: '' });
      setError('');
    },
    onError: (err: any) => setError(err.message ?? 'Broadcast failed'),
  });

  const emailMut = useMutation({
    mutationFn: () =>
      notificationService.sendEmailNotification({
        subject: eForm.subject,
        body: eForm.body,
        recipientRole: eForm.recipientRole || undefined,
        recipientEmails: eForm.recipientEmails
          ? eForm.recipientEmails.split(',').map((e) => e.trim()).filter(Boolean)
          : undefined,
      }),
    onSuccess: (data: any) => {
      toast.success(`Email sent to ${data?.sent ?? '?'} recipient(s)`);
      setEForm({ subject: '', body: '', recipientRole: '', recipientEmails: '' });
      setError('');
    },
    onError: (err: any) => setError(err.message ?? 'Email send failed'),
  });

  return (
    <Card className="mb-6">
      <div className="px-4 pt-4">
        <div className="flex gap-1 border-b border-border mb-4">
          <button
            onClick={() => setTab('broadcast')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'broadcast' ? 'border-umu-red text-umu-red' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Megaphone className="w-4 h-4" /> In-App Broadcast
          </button>
          <button
            onClick={() => setTab('email')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'email' ? 'border-umu-red text-umu-red' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail className="w-4 h-4" /> Email Notification
          </button>
        </div>

        {error && <InlineAlert type="error" message={error} />}

        {tab === 'broadcast' && (
          <form
            className="space-y-3 pb-4"
            onSubmit={(e) => { e.preventDefault(); broadcastMut.mutate(); }}
          >
            <p className="text-xs text-gray-500">Send an in-app notification to all staff or a specific role.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title" required>
                <input
                  className={inputClass}
                  value={bForm.title}
                  onChange={(e) => setBForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Training session cancelled"
                  required
                />
              </Field>
              <Field label="Target Role">
                <select
                  className={inputClass}
                  value={bForm.targetRole}
                  onChange={(e) => setBForm((f) => ({ ...f, targetRole: e.target.value }))}
                >
                  <option value="">All staff</option>
                  <option value="TUTOR">Tutor only</option>
                  <option value="SPORTS_REP">Sports Rep only</option>
                </select>
              </Field>
            </div>
            <Field label="Message" required>
              <textarea
                className={inputClass}
                rows={3}
                value={bForm.message}
                onChange={(e) => setBForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Write your message here…"
                required
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={broadcastMut.isPending}>
                {broadcastMut.isPending ? 'Sending…' : 'Send Broadcast'}
              </Button>
            </div>
          </form>
        )}

        {tab === 'email' && (
          <form
            className="space-y-3 pb-4"
            onSubmit={(e) => { e.preventDefault(); emailMut.mutate(); }}
          >
            <p className="text-xs text-gray-500">Send an email to staff by role or to specific addresses. Requires SMTP configured on the server.</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Subject" required>
                <input
                  className={inputClass}
                  value={eForm.subject}
                  onChange={(e) => setEForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Match schedule update"
                  required
                />
              </Field>
              <Field label="Recipient Role">
                <select
                  className={inputClass}
                  value={eForm.recipientRole}
                  onChange={(e) => setEForm((f) => ({ ...f, recipientRole: e.target.value }))}
                >
                  <option value="">By email address only</option>
                  <option value="TUTOR">All Tutors</option>
                  <option value="SPORTS_REP">All Sports Reps</option>
                </select>
              </Field>
            </div>
            <Field label="Recipient Emails (comma-separated, optional)">
              <input
                className={inputClass}
                value={eForm.recipientEmails}
                onChange={(e) => setEForm((f) => ({ ...f, recipientEmails: e.target.value }))}
                placeholder="coach@umu.ac.ug, admin@umu.ac.ug"
              />
            </Field>
            <Field label="Message Body" required>
              <textarea
                className={inputClass}
                rows={4}
                value={eForm.body}
                onChange={(e) => setEForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Write your email content here…"
                required
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={emailMut.isPending}>
                {emailMut.isPending ? 'Sending…' : 'Send Email'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const canBroadcast = isTutorRole(user) || user?.role === 'SPORTS_REP';
  const [showBroadcast, setShowBroadcast] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications', { params: { pageSize: 100 } })).data,
  });

  const markAll = useMutation({
    mutationFn: async () => { await api.patch('/notifications/read-all'); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => { await api.patch(`/notifications/${id}/read`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const runChecks = useMutation({
    mutationFn: async () => (await api.post('/notifications/run-checks')).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Alert checks completed');
    },
    onError: (err: any) => toast.error(err.message ?? 'Checks failed'),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${data?.unreadCount ?? 0} unread`}
        actions={
          <div className="flex gap-2">
            {canBroadcast && (
              <Button
                variant="secondary"
                onClick={() => setShowBroadcast((v) => !v)}
              >
                <Megaphone className="w-4 h-4 mr-1.5" />
                {showBroadcast ? 'Hide Broadcast' : 'Broadcast'}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => runChecks.mutate()}
              disabled={runChecks.isPending}
              title="Run automated alert checks (scholarship expiry, academic warnings, document expiry)"
            >
              {runChecks.isPending ? 'Checking…' : 'Run Checks'}
            </Button>
            <Button variant="secondary" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              Mark all read
            </Button>
          </div>
        }
      />

      {showBroadcast && canBroadcast && <BroadcastPanel />}

      {!data?.notifications?.length ? (
        <EmptyState message="No notifications." />
      ) : (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {data.notifications.map((n: any) => (
            <div
              key={n.id}
              className={`px-4 py-3 flex justify-between gap-4 ${n.isRead ? '' : 'bg-blue-50/40'}`}
            >
              <div>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  {n.title}
                  {!n.isRead && <Badge color="blue">New</Badge>}
                </div>
                <div className="text-sm text-muted mt-0.5">{n.message}</div>
                <div className="text-xs text-muted mt-1">
                  {n.type} · {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                <Badge color={statusColor(n.severity)}>{n.severity}</Badge>
                {!n.isRead && (
                  <Button variant="secondary" size="sm" onClick={() => markOne.mutate(n.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

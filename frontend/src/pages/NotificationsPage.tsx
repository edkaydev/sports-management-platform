import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader, Spinner, EmptyState, Button, statusColor, Badge } from '@/components/ui';

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications', { params: { pageSize: 100 } })).data,
  });

  const markAll = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${data?.unreadCount ?? 0} unread`}
        actions={
          <Button variant="secondary" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            Mark all read
          </Button>
        }
      />
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

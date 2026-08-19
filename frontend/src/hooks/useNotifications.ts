import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/lib/services/notification.service';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => notificationService.getAll({ pageSize: 100 }) as any,
    enabled: !!user,
    refetchInterval: 60_000,
  });

  const notifications = data?.notifications ?? (Array.isArray(data) ? data : []);
  const unreadCount = data?.unreadCount ?? notifications.filter((n: any) => !n.isRead).length;

  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead() as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      toast.success('All notifications marked as read');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { notifications, unreadCount, isLoading, isError, markRead, markAllRead };
}

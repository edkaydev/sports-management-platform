import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/lib/services/event.service';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useEvents() {
  const queryClient = useQueryClient();

  const { data: events, isLoading, isError } = useQuery({
    queryKey: queryKeys.events.all,
    queryFn: () => eventService.getAll() as any,
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data?.events) return data.events;
      return [];
    },
  });

  const createEvent = useMutation({
    mutationFn: (data: Record<string, unknown>) => eventService.create(data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      toast.success('Event created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      eventService.update(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      toast.success('Event updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => eventService.delete(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      toast.success('Event deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { events: events ?? [], isLoading, isError, createEvent, updateEvent, deleteEvent };
}

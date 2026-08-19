import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { athleteService } from '@/lib/services/athlete.service';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useAthletes(params?: Record<string, unknown>) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKeys.athletes.all, params] as const,
    queryFn: () => athleteService.getAll(params) as any,
  });

  const athletes = data?.athletes ?? (Array.isArray(data) ? data : []);

  const createAthlete = useMutation({
    mutationFn: (data: Record<string, unknown>) => athleteService.create(data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.all });
      toast.success('Athlete created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateAthlete = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      athleteService.update(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.all });
      toast.success('Athlete updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteAthlete = useMutation({
    mutationFn: (id: string) => athleteService.delete(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.athletes.all });
      toast.success('Athlete deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { athletes, isLoading, isError, createAthlete, updateAthlete, deleteAthlete, pagination: data?.pagination };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/lib/services/match.service';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useMatches() {
  const queryClient = useQueryClient();

  const { data: matches, isLoading, isError } = useQuery({
    queryKey: queryKeys.matches.all,
    queryFn: () => matchService.getAll() as any,
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data?.matches) return data.matches;
      return [];
    },
  });

  const createMatch = useMutation({
    mutationFn: (data: Record<string, unknown>) => matchService.create(data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      toast.success('Match created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMatch = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      matchService.update(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      toast.success('Match updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMatch = useMutation({
    mutationFn: (id: string) => matchService.delete(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
      toast.success('Match deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { matches: matches ?? [], isLoading, isError, createMatch, updateMatch, deleteMatch };
}

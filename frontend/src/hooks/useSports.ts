import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sportService } from '@/lib/services/sport.service';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useSports() {
  const queryClient = useQueryClient();

  const { data: sports, isLoading, isError } = useQuery({
    queryKey: queryKeys.sports.all,
    queryFn: () => sportService.getAll() as any,
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data?.sports) return data.sports;
      return [];
    },
  });

  const createSport = useMutation({
    mutationFn: (data: Record<string, unknown>) => sportService.create(data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sports.all });
      toast.success('Sport created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateSport = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      sportService.update(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sports.all });
      toast.success('Sport updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteSport = useMutation({
    mutationFn: (id: string) => sportService.delete(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sports.all });
      toast.success('Sport deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { sports: sports ?? [], isLoading, isError, createSport, updateSport, deleteSport };
}

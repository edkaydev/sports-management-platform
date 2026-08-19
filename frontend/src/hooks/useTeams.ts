import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/lib/services/team.service';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useTeams() {
  const queryClient = useQueryClient();

  const { data: teams, isLoading, isError } = useQuery({
    queryKey: queryKeys.teams.all,
    queryFn: () => teamService.getAll() as any,
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data?.teams) return data.teams;
      return [];
    },
  });

  const createTeam = useMutation({
    mutationFn: (data: Record<string, unknown>) => teamService.create(data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success('Team created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateTeam = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      teamService.update(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success('Team updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteTeam = useMutation({
    mutationFn: (id: string) => teamService.delete(id) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
      toast.success('Team deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { teams: teams ?? [], isLoading, isError, createTeam, updateTeam, deleteTeam };
}

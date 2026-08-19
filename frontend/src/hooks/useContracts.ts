import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractService } from '@/lib/services/contract.service';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useContracts() {
  const queryClient = useQueryClient();

  const { data: contracts, isLoading, isError } = useQuery({
    queryKey: queryKeys.contracts.all,
    queryFn: () => contractService.getAll() as any,
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data?.contracts) return data.contracts;
      return [];
    },
  });

  const createContract = useMutation({
    mutationFn: (data: Record<string, unknown>) => contractService.create(data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
      toast.success('Contract created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateContract = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      contractService.update(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
      toast.success('Contract updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const terminateContract = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      contractService.terminate(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contracts.all });
      toast.success('Contract terminated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { contracts: contracts ?? [], isLoading, isError, createContract, updateContract, terminateContract };
}

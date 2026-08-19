import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scholarshipService } from '@/lib/services/scholarship.service';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export function useScholarships() {
  const queryClient = useQueryClient();

  const { data: scholarships, isLoading, isError } = useQuery({
    queryKey: queryKeys.scholarships.all,
    queryFn: () => scholarshipService.getAll() as any,
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data?.scholarships) return data.scholarships;
      return [];
    },
  });

  const createScholarship = useMutation({
    mutationFn: (data: Record<string, unknown>) => scholarshipService.create(data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scholarships.all });
      toast.success('Scholarship created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateScholarship = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      scholarshipService.update(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scholarships.all });
      toast.success('Scholarship updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const renewScholarship = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      scholarshipService.renew(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scholarships.all });
      toast.success('Scholarship renewed successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const revokeScholarship = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      scholarshipService.revoke(id, data) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scholarships.all });
      toast.success('Scholarship revoked');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { scholarships: scholarships ?? [], isLoading, isError, createScholarship, updateScholarship, renewScholarship, revokeScholarship };
}

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { searchUniversities } from '../services/api';
import type { SearchResponse } from '../types';

export function useUniversitySearch() {
  const queryClient = useQueryClient();

  return useMutation<SearchResponse, Error, string>({
    mutationFn: searchUniversities,
    onSuccess: (data) => {
      // Cache the results for potential reuse
      queryClient.setQueryData(['universitySearch', data.data.degree], data);
    },
  });
}

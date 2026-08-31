import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        // Online-only: retry a couple of times, then surface the error to the UI.
        retry: 2,
      },
    },
  });
}

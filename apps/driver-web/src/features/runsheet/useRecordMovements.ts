'use client';

import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { movementSummary } from '@logistic/core';
import { api, ApiError, type RecordMovementsBody } from '@/lib/api-client';
import { useToast } from '@/components/Toaster';
import { runsheetKey } from './useRunsheet';

/**
 * Record a drop / pick-up for a stop on a given day. Online-only: TanStack retries
 * twice, then this surfaces an error toast with a manual "Retry" that re-runs the
 * same submission.
 */
export function useRecordMovements(stopId: string, date?: string) {
  const qc = useQueryClient();
  const toast = useToast();
  const last = useRef<RecordMovementsBody | null>(null);
  const retry = useRef<(b: RecordMovementsBody) => void>(() => {});

  const mutation = useMutation({
    mutationFn: (body: RecordMovementsBody) => {
      last.current = body;
      return api.recordMovements(stopId, body, date);
    },
    onSuccess: (_res, body) => {
      const parts = [
        body.dropped ? `dropped ${movementSummary(body.dropped)}` : null,
        body.pickedUp ? `picked up ${movementSummary(body.pickedUp)}` : null,
        body.notes != null ? 'note' : null,
      ].filter(Boolean);
      toast.show(parts.length ? `Saved — ${parts.join(', ')}` : 'Saved', { tone: 'success' });
      void qc.invalidateQueries({ queryKey: runsheetKey(date) });
    },
    onError: (err) => {
      const msg =
        err instanceof ApiError && err.status === 404
          ? 'That stop is no longer on the runsheet.'
          : 'Could not save — check your signal.';
      toast.show(msg, {
        tone: 'error',
        action: { label: 'Retry', onClick: () => last.current && retry.current(last.current) },
      });
    },
  });

  retry.current = mutation.mutate;
  return mutation;
}

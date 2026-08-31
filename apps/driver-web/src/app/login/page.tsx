'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api-client';
import { Button, Card, Input, Select, Spinner, Icon } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [driverId, setDriverId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const drivers = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.listDrivers().then((r) => r.drivers),
  });

  const login = useMutation({
    mutationFn: () => api.login(driverId, pin),
    onSuccess: () => {
      router.replace('/route');
      router.refresh();
    },
    onError: (err) => {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Wrong driver or PIN.'
          : 'Could not sign in — try again.',
      );
    },
  });

  return (
    <div className="flex flex-1 flex-col justify-center px-margin-mobile py-10">
      <div className="mb-6 flex items-center gap-2">
        <Icon name="local_shipping" className="text-3xl text-primary" />
        <h1 className="text-headline-md font-black tracking-tight text-primary">DELIVERY OPS</h1>
      </div>
      <p className="mb-6 text-body-md text-on-surface-variant">Sign in to see the runsheet.</p>

      <Card>
        {drivers.isPending ? (
          <Spinner label="Loading drivers…" />
        ) : drivers.isError ? (
          <p className="text-body-md text-error">
            Couldn’t load drivers.{' '}
            <button className="font-bold underline" onClick={() => drivers.refetch()}>
              Retry
            </button>
          </p>
        ) : drivers.data.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            No drivers configured yet. Add them to <code>DRIVERS_JSON</code>.
          </p>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              login.mutate();
            }}
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-on-surface-variant">Driver</span>
              <Select value={driverId} onChange={(e) => setDriverId(e.target.value)} required>
                <option value="" disabled>
                  Choose your name…
                </option>
                {drivers.data.map((d) => (
                  <option key={d.driverId} value={d.driverId}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-on-surface-variant">PIN</span>
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                minLength={3}
                maxLength={12}
              />
            </label>

            {error ? <p className="text-body-md text-error">{error}</p> : null}

            <Button type="submit" block disabled={!driverId || pin.length < 3 || login.isPending}>
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

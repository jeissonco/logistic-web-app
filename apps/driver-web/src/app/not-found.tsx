import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-headline-sm text-primary">Not found</p>
      <p className="text-body-md text-on-surface-variant">That stop isn’t on the runsheet.</p>
      <Link href="/manifest" className="text-body-md font-bold text-secondary underline">
        Back to manifest
      </Link>
    </div>
  );
}

import { Icon } from '@/components/ui';

interface Contact {
  name: string;
  role?: string;
  phone: string;
}

// Office / dispatch contacts. Edit here as the team changes.
const CONTACTS: Contact[] = [
  { name: 'Office', role: 'Dispatch & support', phone: '0412685846' },
  { name: 'Simone Tomic', phone: '0411144134' },
  { name: 'Rob Tomic', phone: '0438123906' },
];

export default function DirectoryPage() {
  return (
    <div className="flex flex-col gap-stack-gap pt-4">
      <h2 className="text-headline-md text-primary">Directory</h2>

      <ul className="flex flex-col gap-3">
        {CONTACTS.map((c) => (
          <li
            key={c.phone}
            className="rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-card-padding shadow-lg"
          >
            <p className="text-headline-sm text-primary">{c.name}</p>
            {c.role ? <p className="text-body-md text-on-surface-variant">{c.role}</p> : null}
            <a
              href={`tel:${c.phone}`}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-label-lg uppercase tracking-wide text-on-secondary active:scale-[0.98]"
            >
              <Icon name="call" className="text-lg" />
              Call {c.phone}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

import 'server-only';

/** True when running under Playwright with `/api` served by the in-memory fixture. */
export const isE2EStub = process.env.E2E_STUB_API === '1';

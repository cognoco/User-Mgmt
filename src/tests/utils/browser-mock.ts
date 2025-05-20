import { setupWorker } from 'msw/browser';

// No global MSW handlers are registered, as all MSW usage is local to specific test files.

export const worker = setupWorker();

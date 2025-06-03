import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorLogger, ConsoleTransport, LogEntry } from '../error-logger';

class MemoryTransport implements ConsoleTransport {
  entries: LogEntry[] = [];
  log(entry: LogEntry) {
    this.entries.push(entry);
  }
}

describe('ErrorLogger', () => {
  let transport: MemoryTransport;
  let logger: ErrorLogger;

  beforeEach(() => {
    transport = new MemoryTransport();
    logger = new ErrorLogger([transport], 2);
  });

  it('buffers and flushes logs', () => {
    logger.info('a');
    expect(transport.entries.length).toBe(0);
    logger.info('b');
    expect(transport.entries.length).toBe(2);
  });

  it('sanitizes sensitive fields', () => {
    logger.error('boom', { user: '1', password: 'secret', token: 't' });
    logger.flush();
    expect(transport.entries[0].context).toEqual({ user: '1', password: '[REDACTED]', token: '[REDACTED]' });
  });

  it('specialized methods set types', () => {
    const err = new Error('oops');
    logger.logServiceError(err, { service: 'svc' });
    logger.flush();
    expect(transport.entries[0].context.type).toBe('service');
    expect(transport.entries[0].context.service).toBe('svc');
  });
});

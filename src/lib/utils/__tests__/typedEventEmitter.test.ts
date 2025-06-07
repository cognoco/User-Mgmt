import { describe, it, expect } from 'vitest';
import { TypedEventEmitter } from '@/lib/utils/typedEventEmitter';

interface TestEvent {
  type: 'a' | 'b';
  payload: string;
}

describe('TypedEventEmitter', () => {
  it('emits events to subscribers', () => {
    const emitter = new TypedEventEmitter<TestEvent>();
    const received: TestEvent[] = [];
    emitter.on(e => received.push(e));

    emitter.emit({ type: 'a', payload: 'foo' });
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ type: 'a', payload: 'foo' });
  });

  it('filters by type with onType', () => {
    const emitter = new TypedEventEmitter<TestEvent>();
    const received: TestEvent[] = [];
    emitter.onType('b', e => received.push(e));

    emitter.emit({ type: 'a', payload: 'foo' });
    emitter.emit({ type: 'b', payload: 'bar' });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ type: 'b', payload: 'bar' });
  });
});

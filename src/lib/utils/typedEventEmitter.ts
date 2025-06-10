export class TypedEventEmitter<T extends { type: string }> {
  private handlers: Array<(event: T) => void> = [];

  /** Emit an event to all listeners */
  emit(event: T): void {
    this.handlers.forEach(h => h(event));
  }

  /** Subscribe to all events */
  on(handler: (event: T) => void): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  /** Subscribe only to a specific event type */
  onType<K extends T['type']>(type: K, handler: (event: Extract<T, { type: K }>) => void): () => void {
    const wrapped = (event: T) => {
      if (event.type === type) {
        handler(event as Extract<T, { type: K }>);
      }
    };
    return this.on(wrapped);
  }
}

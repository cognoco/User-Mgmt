import { NotificationPayload } from '@/lib/services/notification.service';

// Queue entry type with metadata for tracking
interface QueueEntry {
  id: string;
  payload: NotificationPayload;
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  status: 'pending' | 'processing' | 'failed' | 'delivered';
  error?: string;
  createdAt: Date;
  deliveredAt?: Date;
}

// Type definition for notification processor function
type NotificationProcessor = (payload: NotificationPayload) => Promise<boolean>;

export class NotificationQueueService {
  private queue: Map<string, QueueEntry> = new Map();
  private processors: Map<string, NotificationProcessor> = new Map();
  private interval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private maxConcurrent = 5;
  private retryIntervals = [
    1000 * 30,  // 30 seconds
    1000 * 60 * 2,  // 2 minutes
    1000 * 60 * 10, // 10 minutes
    1000 * 60 * 30, // 30 minutes
    1000 * 60 * 60 * 2  // 2 hours
  ];

  constructor() {
    // Start processing queue
    this.startProcessing();
  }

  /**
   * Register a processor function for a specific notification type
   */
  registerProcessor(type: string, processor: NotificationProcessor) {
    this.processors.set(type, processor);
  }

  /**
   * Add a notification to the queue
   */
  enqueue(payload: NotificationPayload, maxAttempts = 3): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    this.queue.set(id, {
      id,
      payload,
      attempts: 0,
      maxAttempts,
      status: 'pending',
      createdAt: new Date()
    });

    // Store in persistent storage (future enhancement)
    this.persistQueue();
    
    return id;
  }

  /**
   * Get the current status of a notification
   */
  getStatus(id: string): QueueEntry | undefined {
    return this.queue.get(id);
  }

  /**
   * Start processing the queue
   */
  private startProcessing() {
    // Process queue every 10 seconds
    this.interval = setInterval(() => this.processQueue(), 10000);
  }

  /**
   * Stop processing the queue
   */
  stopProcessing() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Process pending items in the queue
   */
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingEntries = Array.from(this.queue.values())
        .filter(entry => 
          entry.status === 'pending' && 
          (
            !entry.lastAttempt || 
            this.shouldRetry(entry)
          )
        )
        .slice(0, this.maxConcurrent);

      if (pendingEntries.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Process entries concurrently
      await Promise.all(pendingEntries.map(entry => this.processEntry(entry)));
    } catch (error) {
      console.error('Error processing notification queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queue entry
   */
  private async processEntry(entry: QueueEntry): Promise<void> {
    // Update status to processing
    entry.status = 'processing';
    entry.attempts += 1;
    entry.lastAttempt = new Date();
    
    // Get the processor for this notification type
    const processor = this.processors.get(entry.payload.type);
    
    if (!processor) {
      entry.status = 'failed';
      entry.error = `No processor registered for notification type: ${entry.payload.type}`;
      return;
    }

    try {
      // Process the notification
      const success = await processor(entry.payload);
      
      if (success) {
        entry.status = 'delivered';
        entry.deliveredAt = new Date();
      } else {
        if (entry.attempts >= entry.maxAttempts) {
          entry.status = 'failed';
          entry.error = 'Max retry attempts reached';
        } else {
          entry.status = 'pending'; // Will be retried
          entry.error = 'Delivery unsuccessful, will retry';
        }
      }
    } catch (error) {
      // Failed to process
      if (entry.attempts >= entry.maxAttempts) {
        entry.status = 'failed';
        entry.error = error instanceof Error ? error.message : String(error);
      } else {
        entry.status = 'pending'; // Will be retried
        entry.error = `Error: ${error instanceof Error ? error.message : String(error)}. Will retry.`;
      }
    }

    // Update persistent storage
    this.persistQueue();
  }

  /**
   * Determine if we should retry a failed notification based on time since last attempt
   */
  private shouldRetry(entry: QueueEntry): boolean {
    if (!entry.lastAttempt || entry.attempts >= entry.maxAttempts) {
      return false;
    }

    const now = new Date();
    const timeSinceLastAttempt = now.getTime() - entry.lastAttempt.getTime();
    const retryDelay = this.getRetryDelay(entry.attempts);
    
    return timeSinceLastAttempt >= retryDelay;
  }

  /**
   * Get retry delay based on attempt number (exponential backoff)
   */
  private getRetryDelay(attemptNum: number): number {
    const index = Math.min(attemptNum - 1, this.retryIntervals.length - 1);
    return this.retryIntervals[index];
  }

  /**
   * Persist queue to storage (placeholder for future implementation)
   */
  private persistQueue(): void {
    // In a real implementation, this would save to a database
    // For now we're just keeping in memory
    const pendingCount = Array.from(this.queue.values())
      .filter(item => item.status === 'pending')
      .length;
      
    console.log(`Queue updated: ${this.queue.size} items, ${pendingCount} pending`);
  }

  /**
   * Get notification statistics
   */
  getStats() {
    const entries = Array.from(this.queue.values());
    return {
      total: entries.length,
      pending: entries.filter(e => e.status === 'pending').length,
      processing: entries.filter(e => e.status === 'processing').length,
      delivered: entries.filter(e => e.status === 'delivered').length,
      failed: entries.filter(e => e.status === 'failed').length
    };
  }
}

// Singleton instance
export const notificationQueue = new NotificationQueueService(); 
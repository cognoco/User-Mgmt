/**
 * Structure describing an analytics event.
 */
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

/**
 * Lightweight analytics helper.
 */
export const analytics = {
  /**
   * Track a custom event.
   */
  trackEvent: ({ name, properties }: AnalyticsEvent) => {
    // Implementation would depend on your analytics provider
    console.log(`[Analytics] ${name}`, properties);
  },

  /**
   * Report an error to the analytics backend.
   */
  trackError: (error: Error) => {
    console.error('[Error]', error);
    // Send to error tracking service
  },

  /**
   * Track a page view.
   */
  trackPageView: (path: string) => {
    console.log(`[PageView] ${path}`);
  },
};
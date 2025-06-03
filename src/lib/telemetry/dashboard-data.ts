export interface TimeRange {
  start: Date;
  end: Date;
}

export interface ErrorSummary {
  errorType: string;
  count: number;
  criticalCount: number;
  nonCriticalCount: number;
  lastSeen: Date;
}

export interface ErrorDistribution {
  [dimension: string]: Record<string, number>;
}

export interface UserImpactSummary {
  totalUsers: number;
  impactedBy: Record<string, number>;
}

export interface ErrorTrend {
  timePoints: string[];
  counts: number[];
  movingAverage: number[];
}

import { Telemetry } from '@/lib/monitoring/telemetry';

/**
 * Aggregates telemetry metrics for dashboard usage.
 * This service operates purely in-memory and can be replaced
 * by a database-backed implementation in host applications.
 */
export class ErrorDashboardData {
  constructor(private telemetry: Telemetry) {}

  /** Retrieve most frequent errors within the given time range. */
  async getTopErrors(timeRange: TimeRange, limit = 10): Promise<ErrorSummary[]> {
    const metrics = this.telemetry.getMetrics() as Record<string, any>;
    const list: ErrorSummary[] = [];
    for (const [type, m] of Object.entries(metrics)) {
      const countInRange = (m.events as number[]).filter(
        (t: number) => t >= timeRange.start.getTime() && t <= timeRange.end.getTime()
      ).length;
      if (countInRange === 0) continue;
      list.push({
        errorType: type,
        count: countInRange,
        criticalCount: m.criticalCount,
        nonCriticalCount: m.nonCriticalCount,
        lastSeen: new Date(m.lastSeen),
      });
    }
    return list.sort((a, b) => b.count - a.count).slice(0, limit);
  }

  /** Generate time series data for a specific error. */
  async getErrorTrends(errorCode: string, timeRange: TimeRange): Promise<ErrorTrend> {
    const m = this.telemetry.getMetrics(errorCode) as any;
    if (!m) return { timePoints: [], counts: [], movingAverage: [] };
    const start = timeRange.start.getTime();
    const end = timeRange.end.getTime();
    const buckets = 10;
    const interval = (end - start) / buckets;
    const counts = new Array(buckets).fill(0);
    for (const ts of m.events as number[]) {
      if (ts < start || ts > end) continue;
      const idx = Math.min(Math.floor((ts - start) / interval), buckets - 1);
      counts[idx]++;
    }
    const movingAverage: number[] = [];
    for (let i = 0; i < counts.length; i++) {
      const slice = counts.slice(Math.max(0, i - 2), i + 1);
      movingAverage[i] = slice.reduce((a, b) => a + b, 0) / slice.length;
    }
    const timePoints = [...Array(buckets)].map((_, i) =>
      new Date(start + i * interval).toISOString()
    );
    return { timePoints, counts, movingAverage };
  }

  /** Group errors by dimension (e.g. segment or action). */
  async getErrorDistribution(
    dimensions: string[],
    _timeRange: TimeRange
  ): Promise<ErrorDistribution> {
    const metrics = this.telemetry.getMetrics() as Record<string, any>;
    const result: ErrorDistribution = {};
    for (const dim of dimensions) result[dim] = {};

    for (const m of Object.values(metrics)) {
      if (dimensions.includes('segment')) {
        for (const [seg, c] of (m.segmentImpact as Map<string, number>).entries()) {
          result.segment![seg] = (result.segment![seg] || 0) + c;
        }
      }
      if (dimensions.includes('action')) {
        for (const [act, c] of (m.actionCounts as Map<string, number>).entries()) {
          result.action![act] = (result.action![act] || 0) + c;
        }
      }
      if (dimensions.includes('errorType')) {
        const type = m.type ?? 'unknown';
        result.errorType![type] = (result.errorType![type] || 0) + m.count;
      }
    }
    return result;
  }

  /** Analyze how many users were affected by errors. */
  async getUserImpact(_timeRange: TimeRange): Promise<UserImpactSummary> {
    const metrics = this.telemetry.getMetrics() as Record<string, any>;
    const impactedBy: Record<string, number> = {};
    const userSet = new Set<string>();
    for (const [type, m] of Object.entries(metrics)) {
      impactedBy[type] = m.affectedUsers.size;
      m.affectedUsers.forEach((u: string) => userSet.add(u));
    }
    return { totalUsers: userSet.size, impactedBy };
  }
}

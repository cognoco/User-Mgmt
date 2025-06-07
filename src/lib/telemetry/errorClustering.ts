import { ApplicationError } from '@/core/common/errors';

export interface ClusterSummary {
  id: string;
  pattern: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
}

interface ClusterData {
  pattern: string;
  errors: ApplicationError[];
  firstSeen: number;
  lastSeen: number;
}

export class ErrorClusterer {
  private clusters = new Map<string, ClusterData>();

  addError(error: ApplicationError): string {
    const signature = this.normalize(error.message);
    const key = `${error.code}:${signature}`;
    const now = Date.now();
    const existing = this.clusters.get(key);
    if (existing) {
      existing.errors.push(error);
      existing.lastSeen = now;
    } else {
      this.clusters.set(key, {
        pattern: signature,
        errors: [error],
        firstSeen: now,
        lastSeen: now,
      });
    }
    return key;
  }

  getClusters(): ClusterSummary[] {
    const list: ClusterSummary[] = [];
    for (const [id, data] of this.clusters.entries()) {
      list.push({
        id,
        pattern: data.pattern,
        count: data.errors.length,
        firstSeen: data.firstSeen,
        lastSeen: data.lastSeen,
      });
    }
    return list;
  }

  private normalize(msg: string): string {
    return msg.replace(/[0-9]+/g, '#').toLowerCase();
  }
}

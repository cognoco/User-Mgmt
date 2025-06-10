export interface ServiceStatuses {
  database: string;
  redis: string;
  email: string;
  storage: string;
}

export interface HealthService {
  checkSystemHealth(): Promise<Record<string, any>>;
  checkAllServices(): Promise<ServiceStatuses>;
}

export class DefaultSystemHealthService implements HealthService {
  async checkAllServices(): Promise<ServiceStatuses> {
    // In a real implementation, each check would verify the actual service
    return {
      database: 'ok',
      redis: 'ok',
      email: 'ok',
      storage: 'ok'
    };
  }

  async checkSystemHealth(): Promise<Record<string, any>> {
    const services = await this.checkAllServices();
    const allHealthy = Object.values(services).every((s) => s === 'ok');
    return allHealthy ? { status: 'ok' } : services;
  }
}

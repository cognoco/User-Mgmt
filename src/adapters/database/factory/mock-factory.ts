/**
 * Create an in-memory mock database provider for tests.
 *
 * @param options Optional configuration to seed the mock provider.
 * @returns A minimal {@link DatabaseProvider} implementation.
 */
import type { DatabaseProvider, DatabaseConfig } from '../../../lib/database/types';

class MockDatabaseProvider implements DatabaseProvider {
  // Simplified in-memory store for demonstration
  private users: any[] = [];

  async createUser(data: any) { const user = { id: String(Date.now()), ...data }; this.users.push(user); return user; }
  async getUserById(id: string) { return this.users.find(u => u.id === id) || null; }
  async getUserByEmail(email: string) { return this.users.find(u => u.email === email) || null; }
  async updateUser(id: string, data: any) { const idx = this.users.findIndex(u => u.id === id); if (idx === -1) throw new Error('not found'); this.users[idx] = { ...this.users[idx], ...data }; return this.users[idx]; }
  async deleteUser(id: string) { this.users = this.users.filter(u => u.id !== id); }

  async createProfile() { throw new Error('Not implemented'); }
  async getProfileByUserId() { return null; }
  async updateProfile() { throw new Error('Not implemented'); }
  async deleteProfile() { return; }

  async createUserPreferences() { throw new Error('Not implemented'); }
  async getUserPreferences() { return null; }
  async updateUserPreferences() { throw new Error('Not implemented'); }
  async deleteUserPreferences() { return; }

  async createActivityLog() { throw new Error('Not implemented'); }
  async getUserActivityLogs() { return []; }
  async deleteUserActivityLogs() { return; }

  async getUserWithRelations(id: string) { return null; }
}

export function createMockDatabaseProvider(options: Partial<DatabaseConfig> = {}): DatabaseProvider {
  return new MockDatabaseProvider();
}

export default createMockDatabaseProvider;

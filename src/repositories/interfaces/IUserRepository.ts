/**
 * User Repository Interface
 *
 * Defines the contract for basic CRUD operations on User entities.
 * Implementations should encapsulate all persistence logic
 * so that the rest of the application remains database agnostic.
 */
import type { User, CreateUserDto } from '@/types/user';

export interface IUserRepository {
  /** Find a user by their unique ID */
  findById(id: string): Promise<User | null>;

  /** Find a user by their email address */
  findByEmail(email: string): Promise<User | null>;

  /** Create a new user */
  create(data: CreateUserDto): Promise<User>;

  /** Update an existing user */
  update(id: string, data: Partial<User>): Promise<User>;
}

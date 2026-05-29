import { PrismaClient } from '@prisma/client';

/**
 * Base Repository implementation following SOLID principles
 * Providing common data access patterns
 */
export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  abstract findAll(): Promise<T[]>;
  abstract findById(id: string | number): Promise<T | null>;
  abstract create(data: any): Promise<T>;
  abstract update(id: string | number, data: any): Promise<T>;
  abstract delete(id: string | number): Promise<T>;
}

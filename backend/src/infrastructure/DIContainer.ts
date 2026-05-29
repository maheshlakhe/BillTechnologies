/**
 * Backend Dependency Injection Container
 * Implements the Dependency Inversion Principle by managing dependencies
 * and their lifecycles through a centralized container
 */

import { PrismaClient } from '@prisma/client';
import { CustomerService } from '../services/customerService';
import { ProductService } from '../services/productService';
import { BillService } from '../services/billService';
import { EmailService } from '../services/emailService';
import { AxiosHttpClient } from '../services/http/AxiosHttpClient';
import { MemoryStorageProvider } from '../services/storage/MemoryStorageProvider';

/**
 * Service registry for type-safe dependency injection
 */
export interface ServiceRegistry {
  prisma: PrismaClient;
  customerService: CustomerService;
  productService: ProductService;
  billService: BillService;
  emailService: EmailService;
}

/**
 * Dependency injection container implementation
 * Uses singleton pattern with lazy initialization
 */
export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Register a service instance
   */
  register<T>(key: keyof ServiceRegistry, instance: T): void {
    this.services.set(key as string, instance);
  }

  /**
   * Get a service instance (lazy initialization)
   */
  get<K extends keyof ServiceRegistry>(key: K): ServiceRegistry[K] {
    const service = this.services.get(key as string);

    if (service) {
      return service;
    }

    // Lazy initialization
    const newService = this.createService(key);
    this.services.set(key as string, newService);
    return newService;
  }

  /**
   * Create service instances
   */
  private createService<K extends keyof ServiceRegistry>(key: K): ServiceRegistry[K] {
    switch (key) {
      case 'prisma':
        return new PrismaClient() as any;

      case 'customerService':
        return new CustomerService(new MemoryStorageProvider(), new AxiosHttpClient()) as any;

      case 'productService':
        return new ProductService(new MemoryStorageProvider(), new AxiosHttpClient()) as any;

      case 'billService':
        return new BillService(new MemoryStorageProvider(), new AxiosHttpClient()) as any;

      case 'emailService':
        return new EmailService() as any;

      default:
        throw new Error(`Unknown service: ${key}`);
    }
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
  }
}

/**
 * Convenience functions for common services
 */
export const getPrisma = (): PrismaClient => {
  return DIContainer.getInstance().get('prisma');
};

export const getCustomerService = (): CustomerService => {
  return DIContainer.getInstance().get('customerService');
};

export const getProductService = (): ProductService => {
  return DIContainer.getInstance().get('productService');
};

export const getBillService = (): BillService => {
  return DIContainer.getInstance().get('billService');
};

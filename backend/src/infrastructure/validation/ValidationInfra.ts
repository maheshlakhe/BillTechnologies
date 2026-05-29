import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Backend Validation Infrastructure
 * Provides standardized request validation using Zod
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors,
      });
    }
  };
};

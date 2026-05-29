import { Response } from 'express';

/**
 * Backend Controller Infrastructure
 * Standardizes API response formats and error handling
 */
export class BaseController {
  protected ok<T>(res: Response, data: T, message: string = 'Success') {
    return res.status(200).json({
      status: 'success',
      message,
      data,
    });
  }

  protected created<T>(res: Response, data: T, message: string = 'Created successfully') {
    return res.status(201).json({
      status: 'success',
      message,
      data,
    });
  }

  protected clientError(res: Response, message: string = 'Bad request') {
    return res.status(400).json({
      status: 'error',
      message,
    });
  }

  protected unauthorized(res: Response, message: string = 'Unauthorized') {
    return res.status(401).json({
      status: 'error',
      message,
    });
  }

  protected forbidden(res: Response, message: string = 'Forbidden') {
    return res.status(403).json({
      status: 'error',
      message,
    });
  }

  protected notFound(res: Response, message: string = 'Resource not found') {
    return res.status(404).json({
      status: 'error',
      message,
    });
  }

  protected fail(res: Response, error: Error | string) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: typeof error === 'string' ? error : error.message,
    });
  }
}

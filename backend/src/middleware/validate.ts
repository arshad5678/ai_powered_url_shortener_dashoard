import { Request, Response, NextFunction, RequestHandler } from 'express';

import { ValidationSchemas } from '../types/validation.js';

/**
 * Reusable Express request validation middleware using Zod.
 * Validates request params, query, and/or body.
 * If validation fails, errors are forwarded to the global error handler.
 */
export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as typeof req.params;
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as typeof req.query;
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

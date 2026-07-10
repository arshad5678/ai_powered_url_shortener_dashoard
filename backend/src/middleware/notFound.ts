import { Request, Response, NextFunction, RequestHandler } from 'express';

import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/ErrorCodes.js';

/**
 * Reusable Express route middleware to handle unmatched 404 targets.
 * Forwards an operational AppError with a NOT_FOUND code to the error handler.
 */
export const notFound: RequestHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const err = new AppError(`Route not found - ${req.originalUrl}`, 404, ErrorCodes.NOT_FOUND);
  next(err);
};

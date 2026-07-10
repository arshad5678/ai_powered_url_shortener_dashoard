import { Request, Response, NextFunction, RequestHandler } from 'express';

// Reusable controller wrapper to catch thrown exceptions/rejections and forward them to express errorHandler
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

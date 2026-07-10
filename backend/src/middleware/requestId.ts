import { Request, Response, NextFunction, RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Reusable Express middleware to inject a unique UUID tracking parameter
 * into both Request payload keys and response headers.
 */
export const requestId: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = uuidv4();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

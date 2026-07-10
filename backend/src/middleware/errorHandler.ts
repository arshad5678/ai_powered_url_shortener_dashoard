import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import { ErrorCode, ErrorCodes } from '../errors/ErrorCodes.js';
import { logger } from '../logger/index.js';

// Standard error interface representation
interface ErrorResponseBody {
  success: boolean;
  statusCode: number;
  error: {
    code: string;
    message: string;
    stack?: string;
  };
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let errorCode: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let isOperational = false;
  const errorStack = err.stack;

  // 1. Capture and resolve custom operational AppErrors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    isOperational = err.isOperational;
  }
  // 2. Parse and format schema verification errors from Zod
  else if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    isOperational = true;
  }
  // 3. Handle unknown generic exceptions
  else {
    message = err.message || 'An unexpected error occurred';
  }

  // Log unexpected runtime issues as errors, operational ones as warnings
  if (!isOperational) {
    logger.error(`[ErrorHandler] Unexpected Error: ${err.message}`, {
      stack: err.stack,
      name: err.name,
    });
  } else {
    logger.warn(`[ErrorHandler] Operational Error [${errorCode}]: ${message}`);
  }

  const isDevelopment = env.NODE_ENV === 'development';

  const responseBody: ErrorResponseBody = {
    success: false,
    statusCode,
    error: {
      code: errorCode,
      message,
    },
  };

  // Add the stack trace only during local development
  if (isDevelopment && errorStack) {
    responseBody.error.stack = errorStack;
  }

  res.status(statusCode).json(responseBody);
};

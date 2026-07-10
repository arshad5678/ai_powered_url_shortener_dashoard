import { Prisma } from '@prisma/client';

import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/ErrorCodes.js';
import { logger } from '../logger/index.js';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export abstract class BaseRepository {
  /**
   * Translates database/Prisma errors into operational AppErrors with HTTP status codes.
   * @param error - The raw error caught
   * @param context - Name of the method/context where error occurred
   */
  protected handleError(error: unknown, context: string): never {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[BaseRepository] Database error in ${context}: ${errorMessage}`, { error });

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002': {
          const target = (error.meta?.target as string[] | undefined)?.join(', ') || 'field';
          throw new AppError(
            `Conflict: A record with this ${target} already exists.`,
            409,
            ErrorCodes.CONFLICT
          );
        }
        case 'P2025':
          throw new AppError(
            'Record not found.',
            404,
            ErrorCodes.NOT_FOUND
          );
        case 'P2003':
          throw new AppError(
            'Database constraint violation: Invalid reference.',
            400,
            ErrorCodes.BAD_REQUEST
          );
        default:
          throw new AppError(
            `Database request error: ${error.message}`,
            500,
            ErrorCodes.DATABASE_ERROR
          );
      }
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'An unexpected database error occurred.',
      500,
      ErrorCodes.DATABASE_ERROR
    );
  }

  /**
   * Reusable pagination query helper.
   * @param model - Prisma model delegate (e.g. prisma.link)
   * @param options - Pagination configuration and query arguments
   */
  protected async paginate<
    T,
    FindManyArgs extends { skip?: number; take?: number; where?: unknown },
    CountArgs extends { where?: unknown },
  >(
    model: {
      findMany: (args: FindManyArgs) => Promise<T[]>;
      count: (args: CountArgs) => Promise<number>;
    },
    options: {
      page?: number;
      limit?: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args?: any;
    }
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    try {
      const queryArgs = {
        ...(options.args || {}),
        skip,
        take: limit,
      } as unknown as FindManyArgs;

      const countArgs = {
        where: (options.args as Record<string, unknown> | undefined)?.where,
      } as unknown as CountArgs;

      const [data, total] = await Promise.all([model.findMany(queryArgs), model.count(countArgs)]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.handleError(error, 'paginate');
    }
  }
}

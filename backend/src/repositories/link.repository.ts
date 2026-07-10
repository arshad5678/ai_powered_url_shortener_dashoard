import { Link, Prisma } from '@prisma/client';

import { BaseRepository, PaginatedResult } from './base.repository.js';
import { prisma } from '../database/database.js';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/ErrorCodes.js';

export class LinkRepository extends BaseRepository {
  /**
   * Creates a new shortened Link record.
   * @param data - The Link creation arguments
   */
  async create(data: Prisma.LinkCreateInput): Promise<Link> {
    try {
      return await prisma.link.create({ data });
    } catch (error) {
      this.handleError(error, 'LinkRepository.create');
    }
  }

  /**
   * Finds an active Link record by its ID.
   * @param id - The Link ID
   */
  async findById(id: string): Promise<Link | null> {
    try {
      return await prisma.link.findFirst({
        where: { id, deletedAt: null },
      });
    } catch (error) {
      this.handleError(error, 'LinkRepository.findById');
    }
  }

  /**
   * Finds an active Link record by its short code.
   * @param shortCode - The short code slug
   */
  async findByShortCode(shortCode: string): Promise<Link | null> {
    try {
      return await prisma.link.findFirst({
        where: {
          OR: [
            { shortCode },
            { customAlias: shortCode },
          ],
          deletedAt: null,
        },
      });
    } catch (error) {
      this.handleError(error, 'LinkRepository.findByShortCode');
    }
  }

  /**
   * Finds an active Link record by its custom alias.
   * @param customAlias - The custom alias string
   */
  async findByCustomAlias(customAlias: string): Promise<Link | null> {
    try {
      return await prisma.link.findFirst({
        where: { customAlias, deletedAt: null },
      });
    } catch (error) {
      this.handleError(error, 'LinkRepository.findByCustomAlias');
    }
  }

  /**
   * Finds and filters all active links using pagination.
   * @param options - Pagination and search options
   */
  async findAll(
    options: { page?: number; limit?: number; search?: string } = {}
  ): Promise<PaginatedResult<Link>> {
    const { page, limit, search } = options;

    const where: Prisma.LinkWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { shortCode: { contains: search, mode: 'insensitive' } },
        { customAlias: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.paginate<Link, Prisma.LinkFindManyArgs, Prisma.LinkCountArgs>(prisma.link, {
      page,
      limit,
      args: {
        where,
        orderBy: { createdAt: 'desc' },
      },
    });
  }

  /**
   * Updates an existing Link record.
   * @param id - The Link ID
   * @param data - The Link update arguments
   */
  async update(id: string, data: Prisma.LinkUpdateInput): Promise<Link> {
    try {
      return await prisma.link.update({
        where: { id },
        data,
      });
    } catch (error) {
      this.handleError(error, 'LinkRepository.update');
    }
  }

  /**
   * Performs a soft delete by updating the deletedAt timestamp.
   * @param id - The Link ID
   */
  async softDelete(id: string): Promise<Link> {
    try {
      return await prisma.link.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      this.handleError(error, 'LinkRepository.softDelete');
    }
  }

  /**
   * Toggles the active status of a Link.
   * @param id - The Link ID
   */
  async toggleStatus(id: string): Promise<Link> {
    try {
      const link = await this.findById(id);
      if (!link) {
        throw new AppError('Link not found.', 404, ErrorCodes.NOT_FOUND);
      }
      return await prisma.link.update({
        where: { id },
        data: { isActive: !link.isActive },
      });
    } catch (error) {
      this.handleError(error, 'LinkRepository.toggleStatus');
    }
  }

  /**
   * Verifies if an active custom alias exists in the database.
   * @param customAlias - The custom alias string
   */
  async existsByAlias(customAlias: string): Promise<boolean> {
    try {
      const count = await prisma.link.count({
        where: { customAlias, deletedAt: null },
      });
      return count > 0;
    } catch (error) {
      this.handleError(error, 'LinkRepository.existsByAlias');
    }
  }

  /**
   * Verifies if an active short code exists in the database.
   * @param shortCode - The short code slug
   */
  async existsByShortCode(shortCode: string): Promise<boolean> {
    try {
      const count = await prisma.link.count({
        where: { shortCode, deletedAt: null },
      });
      return count > 0;
    } catch (error) {
      this.handleError(error, 'LinkRepository.existsByShortCode');
    }
  }

  /**
   * Compiles links metrics grouped by active/inactive/expiry states.
   */
  async getStatusCounts(): Promise<{
    total: number;
    active: number;
    disabled: number;
    expired: number;
  }> {
    try {
      const now = new Date();
      const [total, active, disabled, expired] = await Promise.all([
        prisma.link.count({ where: { deletedAt: null } }),
        prisma.link.count({ where: { isActive: true, deletedAt: null } }),
        prisma.link.count({ where: { isActive: false, deletedAt: null } }),
        prisma.link.count({ where: { expiresAt: { lt: now }, deletedAt: null } }),
      ]);
      return { total, active, disabled, expired };
    } catch (error) {
      this.handleError(error, 'LinkRepository.getStatusCounts');
    }
  }
}

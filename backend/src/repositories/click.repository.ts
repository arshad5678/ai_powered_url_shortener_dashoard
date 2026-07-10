import { Click, Prisma } from '@prisma/client';

import { BaseRepository, PaginatedResult } from './base.repository.js';
import { prisma } from '../database/database.js';

export class ClickRepository extends BaseRepository {
  /**
   * Records a link Click event.
   * @param data - The Click creation arguments
   */
  async create(data: Prisma.ClickCreateInput): Promise<Click> {
    try {
      return await prisma.click.create({ data });
    } catch (error) {
      this.handleError(error, 'ClickRepository.create');
    }
  }

  /**
   * Finds all click records associated with a Link ID (with pagination).
   * @param linkId - The Link ID
   * @param options - Pagination options
   */
  async findByLinkId(
    linkId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResult<Click>> {
    return this.paginate<Click, Prisma.ClickFindManyArgs, Prisma.ClickCountArgs>(prisma.click, {
      page: options.page,
      limit: options.limit,
      args: {
        where: { linkId },
        orderBy: { clickedAt: 'desc' },
      },
    });
  }

  /**
   * Counts the total number of clicks for a given link ID.
   * @param linkId - The Link ID
   */
  async countByLink(linkId: string): Promise<number> {
    try {
      return await prisma.click.count({
        where: { linkId },
      });
    } catch (error) {
      this.handleError(error, 'ClickRepository.countByLink');
    }
  }

  /**
   * Aggregates click statistics by country, browser, and operating system.
   * @param linkId - The Link ID
   * @param options - Date range filtering
   */
  async getAnalytics(
    linkId: string,
    options: { rangeDays?: number } = {}
  ): Promise<{
    totalClicks: number;
    byCountry: Array<{ country: string | null; count: number }>;
    byBrowser: Array<{ browser: string | null; count: number }>;
    byOS: Array<{ operatingSystem: string | null; count: number }>;
  }> {
    try {
      const rangeDays = options.rangeDays || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - rangeDays);

      const where: Prisma.ClickWhereInput = {
        linkId,
        clickedAt: {
          gte: startDate,
        },
      };

      const [totalClicks, countryGroup, browserGroup, osGroup] = await Promise.all([
        prisma.click.count({ where }),
        prisma.click.groupBy({
          by: ['country'],
          where,
          _count: { id: true },
        }),
        prisma.click.groupBy({
          by: ['browser'],
          where,
          _count: { id: true },
        }),
        prisma.click.groupBy({
          by: ['operatingSystem'],
          where,
          _count: { id: true },
        }),
      ]);

      return {
        totalClicks,
        byCountry: countryGroup.map((g) => ({ country: g.country, count: g._count.id })),
        byBrowser: browserGroup.map((g) => ({ browser: g.browser, count: g._count.id })),
        byOS: osGroup.map((g) => ({ operatingSystem: g.operatingSystem, count: g._count.id })),
      };
    } catch (error) {
      this.handleError(error, 'ClickRepository.getAnalytics');
    }
  }

  /**
   * Aggregates browser statistics at database-level.
   */
  async getBrowserStats(
    linkId: string,
    startDate: Date
  ): Promise<Array<{ browser: string | null; count: number }>> {
    try {
      const stats = await prisma.click.groupBy({
        by: ['browser'],
        where: { linkId, clickedAt: { gte: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      });
      return stats.map((s) => ({ browser: s.browser, count: s._count.id }));
    } catch (error) {
      this.handleError(error, 'ClickRepository.getBrowserStats');
    }
  }

  /**
   * Aggregates operating system statistics at database-level.
   */
  async getOSStats(
    linkId: string,
    startDate: Date
  ): Promise<Array<{ operatingSystem: string | null; count: number }>> {
    try {
      const stats = await prisma.click.groupBy({
        by: ['operatingSystem'],
        where: { linkId, clickedAt: { gte: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      });
      return stats.map((s) => ({ operatingSystem: s.operatingSystem, count: s._count.id }));
    } catch (error) {
      this.handleError(error, 'ClickRepository.getOSStats');
    }
  }

  /**
   * Aggregates country statistics at database-level.
   */
  async getCountryStats(
    linkId: string,
    startDate: Date
  ): Promise<Array<{ country: string | null; count: number }>> {
    try {
      const stats = await prisma.click.groupBy({
        by: ['country'],
        where: { linkId, clickedAt: { gte: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      });
      return stats.map((s) => ({ country: s.country, count: s._count.id }));
    } catch (error) {
      this.handleError(error, 'ClickRepository.getCountryStats');
    }
  }

  /**
   * Aggregates referrer statistics at database-level.
   */
  async getReferrerStats(
    linkId: string,
    startDate: Date
  ): Promise<Array<{ referrer: string | null; count: number }>> {
    try {
      const stats = await prisma.click.groupBy({
        by: ['referrer'],
        where: { linkId, clickedAt: { gte: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      });
      return stats.map((s) => ({ referrer: s.referrer, count: s._count.id }));
    } catch (error) {
      this.handleError(error, 'ClickRepository.getReferrerStats');
    }
  }

  /**
   * Fetches only click timestamps in range to allow efficient in-memory date timeline grouping.
   */
  async getClickTimestamps(linkId: string, startDate: Date): Promise<Date[]> {
    try {
      const clicks = await prisma.click.findMany({
        where: { linkId, clickedAt: { gte: startDate } },
        select: { clickedAt: true },
        orderBy: { clickedAt: 'asc' },
      });
      return clicks.map((c) => c.clickedAt);
    } catch (error) {
      this.handleError(error, 'ClickRepository.getClickTimestamps');
    }
  }

  /**
   * Counts click events occurring inside a target date range.
   */
  async countClicksInRange(startDate?: Date, endDate?: Date): Promise<number> {
    try {
      const where: Prisma.ClickWhereInput = {};
      if (startDate || endDate) {
        where.clickedAt = {};
        if (startDate) where.clickedAt.gte = startDate;
        if (endDate) where.clickedAt.lt = endDate;
      }
      return await prisma.click.count({ where });
    } catch (error) {
      this.handleError(error, 'ClickRepository.countClicksInRange');
    }
  }
}

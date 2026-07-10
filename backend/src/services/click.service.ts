import { HttpStatus } from '../constants/httpStatus.js';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/ErrorCodes.js';
import { logger } from '../logger/index.js';
import { ClickRepository } from '../repositories/click.repository.js';
import { LinkRepository } from '../repositories/link.repository.js';

export interface StatItemDto {
  name: string;
  count: number;
  percentage: number;
}

export interface TimelineDataDto {
  date: string;
  count: number;
}

export interface LinkAnalyticsDto {
  totalClicks: number;
  timeline: TimelineDataDto[];
  browsers: StatItemDto[];
  operatingSystems: StatItemDto[];
  countries: StatItemDto[];
  referrers: StatItemDto[];
}

export interface DashboardAnalyticsDto {
  links: {
    total: number;
    active: number;
    disabled: number;
    expired: number;
  };
  clicks: {
    total: number;
    today: { count: number; growth: number };
    last7Days: { count: number; growth: number };
    last30Days: { count: number; growth: number };
  };
}

const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

const mapToStatItems = (
  items: Array<{ name: string | null; count: number }>,
  total: number
): StatItemDto[] => {
  return items.map((item) => ({
    name: item.name || 'Unknown',
    count: item.count,
    percentage: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(2)) : 0,
  }));
};

export class ClickService {
  private clickRepository: ClickRepository;
  private linkRepository: LinkRepository;

  constructor() {
    this.clickRepository = new ClickRepository();
    this.linkRepository = new LinkRepository();
  }

  /**
   * Records a new short link Click event, validating the link's integrity.
   */
  async recordClick(
    linkId: string,
    data: {
      browser?: string;
      operatingSystem?: string;
      country?: string;
      referrer?: string;
      ipAddress?: string;
    }
  ): Promise<boolean> {
    logger.info(`[ClickService] Logging click event for link ID: ${linkId}`);
    const link = await this.linkRepository.findById(linkId);

    if (!link) {
      logger.warn(`[ClickService] Link not found or has been deleted: ${linkId}`);
      return false;
    }

    if (!link.isActive) {
      logger.info(`[ClickService] Link is disabled/inactive: ${linkId}`);
      return false;
    }

    if (link.expiresAt && new Date(link.expiresAt) <= new Date()) {
      logger.info(`[ClickService] Link has expired: ${linkId}`);
      return false;
    }

    await this.clickRepository.create({
      link: { connect: { id: linkId } },
      browser: data.browser || null,
      operatingSystem: data.operatingSystem || null,
      country: data.country || null,
      referrer: data.referrer || null,
      ipAddress: data.ipAddress || null,
    });

    return true;
  }

  /**
   * Compiles comprehensive analytics telemetry for a specific link.
   */
  async getLinkAnalytics(linkId: string, rangeDays: number = 7): Promise<LinkAnalyticsDto> {
    const link = await this.linkRepository.findById(linkId);
    if (!link) {
      throw new AppError(
        'Link not found or has been deleted.',
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const [browsersRaw, osRaw, countriesRaw, referrersRaw, timeline] = await Promise.all([
      this.clickRepository.getBrowserStats(linkId, startDate),
      this.clickRepository.getOSStats(linkId, startDate),
      this.clickRepository.getCountryStats(linkId, startDate),
      this.clickRepository.getReferrerStats(linkId, startDate),
      this.getDailyClicks(linkId, rangeDays),
    ]);

    const totalClicks = timeline.reduce((sum, item) => sum + item.count, 0);

    const browsers = mapToStatItems(
      browsersRaw.map((b) => ({ name: b.browser, count: b.count })),
      totalClicks
    );
    const operatingSystems = mapToStatItems(
      osRaw.map((o) => ({ name: o.operatingSystem, count: o.count })),
      totalClicks
    );
    const countries = mapToStatItems(
      countriesRaw.map((c) => ({ name: c.country, count: c.count })),
      totalClicks
    );
    const referrers = mapToStatItems(
      referrersRaw.map((r) => ({ name: r.referrer, count: r.count })),
      totalClicks
    );

    return {
      totalClicks,
      timeline,
      browsers,
      operatingSystems,
      countries,
      referrers,
    };
  }

  /**
   * Aggregates statistics across all links for the system dashboard.
   */
  async getDashboardAnalytics(): Promise<DashboardAnalyticsDto> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const previousYesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const previous7to14DaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previous30to60DaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      linkCounts,
      totalClicks,
      clicksToday,
      clicks7Days,
      clicks30Days,
      clicksYesterday,
      clicksPrev7Days,
      clicksPrev30Days,
    ] = await Promise.all([
      this.linkRepository.getStatusCounts(),
      this.clickRepository.countClicksInRange(),
      this.clickRepository.countClicksInRange(oneDayAgo),
      this.clickRepository.countClicksInRange(sevenDaysAgo),
      this.clickRepository.countClicksInRange(thirtyDaysAgo),
      this.clickRepository.countClicksInRange(previousYesterday, oneDayAgo),
      this.clickRepository.countClicksInRange(previous7to14DaysAgo, sevenDaysAgo),
      this.clickRepository.countClicksInRange(previous30to60DaysAgo, thirtyDaysAgo),
    ]);

    return {
      links: linkCounts,
      clicks: {
        total: totalClicks,
        today: {
          count: clicksToday,
          growth: calculateGrowth(clicksToday, clicksYesterday),
        },
        last7Days: {
          count: clicks7Days,
          growth: calculateGrowth(clicks7Days, clicksPrev7Days),
        },
        last30Days: {
          count: clicks30Days,
          growth: calculateGrowth(clicks30Days, clicksPrev30Days),
        },
      },
    };
  }

  /**
   * Compiles daily click counts inside a range to construct charts.
   */
  async getDailyClicks(linkId: string, rangeDays: number = 7): Promise<TimelineDataDto[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const timestamps = await this.clickRepository.getClickTimestamps(linkId, startDate);
    const groups: Record<string, number> = {};

    // Initialize date ranges with 0 values to represent clean empty ticks in line charts
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      groups[dateStr] = 0;
    }

    for (const ts of timestamps) {
      const dateStr = ts.toISOString().split('T')[0];
      if (groups[dateStr] !== undefined) {
        groups[dateStr]++;
      }
    }

    return Object.entries(groups).map(([date, count]) => ({ date, count }));
  }

  /**
   * Retrieves browser popularity counts with percentages.
   */
  async getTopBrowsers(linkId: string, rangeDays: number = 7): Promise<StatItemDto[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const stats = await this.clickRepository.getBrowserStats(linkId, startDate);
    const total = stats.reduce((sum, item) => sum + item.count, 0);

    return mapToStatItems(
      stats.map((b) => ({ name: b.browser, count: b.count })),
      total
    );
  }

  /**
   * Retrieves operating system popularity counts with percentages.
   */
  async getTopOperatingSystems(linkId: string, rangeDays: number = 7): Promise<StatItemDto[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const stats = await this.clickRepository.getOSStats(linkId, startDate);
    const total = stats.reduce((sum, item) => sum + item.count, 0);

    return mapToStatItems(
      stats.map((o) => ({ name: o.operatingSystem, count: o.count })),
      total
    );
  }

  /**
   * Retrieves country popularity counts with percentages.
   */
  async getTopCountries(linkId: string, rangeDays: number = 7): Promise<StatItemDto[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const stats = await this.clickRepository.getCountryStats(linkId, startDate);
    const total = stats.reduce((sum, item) => sum + item.count, 0);

    return mapToStatItems(
      stats.map((c) => ({ name: c.country, count: c.count })),
      total
    );
  }

  /**
   * Groups and retrieves top referrers with percentages.
   */
  async getTopReferrers(linkId: string, rangeDays: number = 7): Promise<StatItemDto[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - rangeDays);

    const stats = await this.clickRepository.getReferrerStats(linkId, startDate);
    const total = stats.reduce((sum, item) => sum + item.count, 0);

    return mapToStatItems(
      stats.map((r) => ({ name: r.referrer, count: r.count })),
      total
    );
  }
}

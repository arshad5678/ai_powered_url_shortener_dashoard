import { Link } from '@prisma/client';

import { env } from '../config/env.js';
import { HttpStatus } from '../constants/httpStatus.js';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/ErrorCodes.js';
import { logger } from '../logger/index.js';
import { PaginatedResult } from '../repositories/base.repository.js';
import { LinkRepository } from '../repositories/link.repository.js';
import { encode } from '../utils/base62.js';

export interface LinkDto {
  id: string;
  title: string | null;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  customAlias: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generates a unique Base62 short code from a random 32-bit positive integer bounds.
 */
const generateBase62Code = (): string => {
  const min = 916132832; // 62^5 (ensures at least 6 characters)
  const max = 56800235583; // 62^6 - 1 (ensures at most 6 characters)
  const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
  return encode(randomInt);
};

/**
 * Maps database Link objects into clean Link DTO responses.
 */
const mapToDto = (link: Link): LinkDto => {
  return {
    id: link.id,
    title: link.title,
    originalUrl: link.originalUrl,
    shortCode: link.shortCode,
    shortUrl: `${env.FRONTEND_URL}/${link.shortCode}`,
    customAlias: link.customAlias,
    isActive: link.isActive,
    expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
  };
};

export class LinkService {
  private linkRepository: LinkRepository;

  constructor() {
    this.linkRepository = new LinkRepository();
  }

  /**
   * Helper to fetch an active link by ID, throwing a NotFound AppError if not found.
   */
  private async getLinkOrThrow(id: string): Promise<Link> {
    const link = await this.linkRepository.findById(id);
    if (!link) {
      throw new AppError(
        'Link not found or has been deleted.',
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }
    return link;
  }

  /**
   * Creates a new shortened Link.
   */
  async createLink(data: {
    title: string;
    originalUrl: string;
    shortCode?: string;
    customAlias?: string;
    expiresAt?: Date | string;
  }): Promise<LinkDto> {
    logger.info(`[LinkService] Creating short link: ${data.shortCode || 'auto-generate'}`);

    // 1. Verify expiresAt is in the future
    if (data.expiresAt) {
      const expiryDate = new Date(data.expiresAt);
      if (expiryDate <= new Date()) {
        throw new AppError(
          'Expiry date must be in the future.',
          HttpStatus.BAD_REQUEST,
          ErrorCodes.BAD_REQUEST
        );
      }
    }

    // 2. Validate customAlias duplication
    if (data.customAlias) {
      const aliasExists = await this.linkRepository.existsByAlias(data.customAlias);
      if (aliasExists) {
        throw new AppError(
          `The custom alias "${data.customAlias}" is already taken.`,
          HttpStatus.CONFLICT,
          ErrorCodes.CONFLICT
        );
      }
    }

    // 3. Resolve shortCode (use provided or generate unique Base62)
    let shortCode = data.shortCode;
    if (shortCode) {
      const shortCodeExists = await this.linkRepository.existsByShortCode(shortCode);
      if (shortCodeExists) {
        throw new AppError(
          `The short code "${shortCode}" is already taken.`,
          HttpStatus.CONFLICT,
          ErrorCodes.CONFLICT
        );
      }
    } else {
      // Loop to guarantee generated slug uniqueness (up to 5 attempts)
      let attempts = 0;
      let isUnique = false;
      do {
        shortCode = generateBase62Code();
        isUnique = !(await this.linkRepository.existsByShortCode(shortCode));
        attempts++;
      } while (!isUnique && attempts < 5);

      if (!isUnique) {
        throw new AppError(
          'Failed to generate a unique short code after 5 attempts.',
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCodes.INTERNAL_SERVER_ERROR
        );
      }
    }

    const newLink = await this.linkRepository.create({
      title: data.title,
      originalUrl: data.originalUrl,
      shortCode,
      customAlias: data.customAlias || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });

    return mapToDto(newLink);
  }

  /**
   * Retrieves an active Link by ID.
   */
  async getLinkById(id: string): Promise<LinkDto> {
    const link = await this.getLinkOrThrow(id);
    return mapToDto(link);
  }

  /**
   * Retrieves an active Link by short code.
   */
  async getLinkByShortCode(shortCode: string): Promise<LinkDto> {
    const link = await this.linkRepository.findByShortCode(shortCode);
    if (!link) {
      throw new AppError(
        'Link not found or has been deleted.',
        HttpStatus.NOT_FOUND,
        ErrorCodes.NOT_FOUND
      );
    }
    return mapToDto(link);
  }

  /**
   * Returns a paginated list of active links.
   */
  async getAllLinks(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: 'createdAt' | 'title' | 'originalUrl' | 'shortCode';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<PaginatedResult<LinkDto>> {
    const result = await this.linkRepository.findAll({
      page: options.page,
      limit: options.limit,
      search: options.search,
    });

    const mappedData = result.data.map(mapToDto);

    // Apply sorting in-memory
    if (options.sortBy) {
      const field = options.sortBy;
      const order = options.sortOrder === 'asc' ? 1 : -1;

      mappedData.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];

        if (valA === null) return 1 * order;
        if (valB === null) return -1 * order;

        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });
    }

    return {
      data: mappedData,
      meta: result.meta,
    };
  }

  /**
   * Updates an existing Link record.
   */
  async updateLink(
    id: string,
    data: {
      title?: string;
      originalUrl?: string;
      customAlias?: string;
      expiresAt?: Date | string;
    }
  ): Promise<LinkDto> {
    logger.info(`[LinkService] Updating link ID: ${id}`);
    const link = await this.getLinkOrThrow(id);

    // 1. Verify expiresAt is in the future
    if (data.expiresAt) {
      const expiryDate = new Date(data.expiresAt);
      if (expiryDate <= new Date()) {
        throw new AppError(
          'Expiry date must be in the future.',
          HttpStatus.BAD_REQUEST,
          ErrorCodes.BAD_REQUEST
        );
      }
    }

    // 2. Validate new customAlias is unique
    if (data.customAlias && data.customAlias !== link.customAlias) {
      const aliasExists = await this.linkRepository.existsByAlias(data.customAlias);
      if (aliasExists) {
        throw new AppError(
          `The custom alias "${data.customAlias}" is already taken.`,
          HttpStatus.CONFLICT,
          ErrorCodes.CONFLICT
        );
      }
    }

    const updatePayload = {
      title: data.title !== undefined ? data.title : undefined,
      originalUrl: data.originalUrl !== undefined ? data.originalUrl : undefined,
      customAlias: data.customAlias !== undefined ? data.customAlias || null : undefined,
      expiresAt:
        data.expiresAt !== undefined ? (data.expiresAt ? new Date(data.expiresAt) : null) : undefined,
    };

    const updatedLink = await this.linkRepository.update(id, updatePayload);
    return mapToDto(updatedLink);
  }

  /**
   * Toggles the active status of a Link.
   */
  async toggleLinkStatus(id: string): Promise<LinkDto> {
    logger.info(`[LinkService] Toggling status for link ID: ${id}`);
    await this.getLinkOrThrow(id);
    const updatedLink = await this.linkRepository.toggleStatus(id);
    return mapToDto(updatedLink);
  }

  /**
   * Performs soft deletion of a Link.
   */
  async deleteLink(id: string): Promise<LinkDto> {
    logger.info(`[LinkService] Soft deleting link ID: ${id}`);
    await this.getLinkOrThrow(id);
    const deletedLink = await this.linkRepository.softDelete(id);
    return mapToDto(deletedLink);
  }

  /**
   * Checks if a custom alias is currently available (not taken).
   */
  async checkAliasAvailability(customAlias: string): Promise<boolean> {
    const exists = await this.linkRepository.existsByAlias(customAlias);
    return !exists;
  }

  /**
   * Retrieves the destination originalUrl for redirection, enforcing lifecycle checks.
   * Throws operational AppErrors with appropriate HTTP status codes on failure.
   */
  async getRedirectUrl(shortCode: string): Promise<{ id: string; originalUrl: string }> {
    const link = await this.linkRepository.findByShortCode(shortCode);
    if (!link) {
      throw new AppError('Link not found or has been deleted.', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
    }

    if (!link.isActive) {
      throw new AppError('Link is inactive.', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
    }

    if (link.expiresAt && new Date(link.expiresAt) <= new Date()) {
      throw new AppError('Link has expired.', 410, ErrorCodes.BAD_REQUEST);
    }

    return {
      id: link.id,
      originalUrl: link.originalUrl,
    };
  }
}

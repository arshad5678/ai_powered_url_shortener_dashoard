export interface Link {
  id: string;
  title: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  customAlias: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  clicksCount?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface Click {
  id: string;
  linkId: string;
  browser: string;
  operatingSystem: string;
  country: string;
  referrer: string;
  ipAddress: string;
  clickedAt: string;
}

export interface DashboardStats {
  links: {
    total: number;
    active: number;
    disabled: number;
    expired: number;
    growth: number;
  };
  clicks: {
    total: number;
    today: number;
    growth: number;
  };
}

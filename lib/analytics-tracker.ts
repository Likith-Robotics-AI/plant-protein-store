// Advanced Analytics Tracker
// Client-side tracking utility for user behavior and analytics

import { AnalyticsEvent } from './types';

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Get device type
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Get browser info
function getBrowser(): string {
  if (typeof window === 'undefined') return 'unknown';

  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
}

// Get referrer
function getReferrer(): string {
  if (typeof document === 'undefined') return '';
  return document.referrer || 'direct';
}

/**
 * Track a generic analytics event
 */
export async function trackEvent(
  event_type: AnalyticsEvent['event_type'],
  page: string,
  options?: {
    product_id?: string;
    duration_seconds?: number;
    scroll_depth_percentage?: number;
    metadata?: any;
  }
): Promise<void> {
  try {
    const payload = {
      event_type,
      page,
      product_id: options?.product_id || null,
      session_id: getSessionId(),
      duration_seconds: options?.duration_seconds || null,
      scroll_depth_percentage: options?.scroll_depth_percentage || null,
      device_type: getDeviceType(),
      browser: getBrowser(),
      referrer: getReferrer(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      metadata: options?.metadata || null,
    };

    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Track page view
 */
export async function trackPageView(page: string): Promise<void> {
  await trackEvent('page_view', page);
}

/**
 * Track product view with duration
 */
export async function trackProductView(
  productId: string,
  page: string,
  durationSeconds?: number
): Promise<void> {
  await trackEvent('product_view', page, {
    product_id: productId,
    duration_seconds: durationSeconds,
  });
}

/**
 * Track buy button click
 */
export async function trackBuyClick(productId: string, page: string): Promise<void> {
  await trackEvent('buy_click', page, {
    product_id: productId,
  });
}

/**
 * Track add to cart
 */
export async function trackAddToCart(productId: string, page: string, quantity: number): Promise<void> {
  await trackEvent('add_to_cart', page, {
    product_id: productId,
    metadata: { quantity },
  });
}

/**
 * Track scroll depth
 */
export async function trackScrollDepth(page: string, scrollPercentage: number): Promise<void> {
  await trackEvent('page_view', page, {
    scroll_depth_percentage: Math.round(scrollPercentage),
  });
}

/**
 * Scroll depth tracker hook
 */
export function useScrollDepthTracker(page: string) {
  if (typeof window === 'undefined') return;

  let maxScrollDepth = 0;
  let tracked = false;

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;

    const scrollPercentage = ((scrollTop + windowHeight) / documentHeight) * 100;
    maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);

    // Track when user reaches 75% and hasn't been tracked yet
    if (maxScrollDepth >= 75 && !tracked) {
      tracked = true;
      trackScrollDepth(page, maxScrollDepth);
    }
  };

  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
    // Track final scroll depth on unmount
    if (maxScrollDepth > 0) {
      trackScrollDepth(page, maxScrollDepth);
    }
  };
}

/**
 * Time tracker for measuring page/product view duration
 */
export class TimeTracker {
  private startTime: number;
  private page: string;
  private productId?: string;
  private tracked: boolean = false;

  constructor(page: string, productId?: string) {
    this.startTime = Date.now();
    this.page = page;
    this.productId = productId;
  }

  /**
   * Get current duration in seconds
   */
  getDuration(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Track the duration
   */
  async track(): Promise<void> {
    if (this.tracked) return;
    this.tracked = true;

    const durationSeconds = this.getDuration();

    if (this.productId) {
      await trackProductView(this.productId, this.page, durationSeconds);
    } else {
      await trackEvent('page_view', this.page, {
        duration_seconds: durationSeconds,
      });
    }
  }

  /**
   * Stop tracking and send event
   */
  async stop(): Promise<void> {
    await this.track();
  }
}

/**
 * Session tracker
 */
export class SessionTracker {
  private static instance: SessionTracker;
  private sessionStart: number;
  private sessionId: string;

  private constructor() {
    this.sessionId = getSessionId();
    this.sessionStart = Date.now();
    this.trackSessionStart();
    this.setupBeforeUnload();
  }

  static getInstance(): SessionTracker {
    if (!SessionTracker.instance) {
      SessionTracker.instance = new SessionTracker();
    }
    return SessionTracker.instance;
  }

  private trackSessionStart(): void {
    trackEvent('session_start', window.location.pathname);
  }

  private trackSessionEnd(): void {
    const durationSeconds = Math.floor((Date.now() - this.sessionStart) / 1000);
    trackEvent('session_end', window.location.pathname, {
      duration_seconds: durationSeconds,
    });
  }

  private setupBeforeUnload(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });
  }

  getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStart) / 1000);
  }
}

/**
 * Initialize analytics tracking for a page
 */
export function initializeAnalytics(page: string, productId?: string): TimeTracker {
  // Initialize session tracker
  SessionTracker.getInstance();

  // Track page view
  trackPageView(page);

  // Create time tracker
  const timeTracker = new TimeTracker(page, productId);

  // Setup visibility change listener to track when user leaves
  if (typeof document !== 'undefined') {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        timeTracker.track();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return timeTracker;
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Get analytics summary for date range
 */
export async function getAnalyticsSummary(startDate: string, endDate: string) {
  try {
    const response = await fetch(
      `/api/analytics-advanced?start_date=${startDate}&end_date=${endDate}`
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch analytics summary:', error);
    return null;
  }
}

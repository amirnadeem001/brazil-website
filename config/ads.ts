import type { AdUnitKey } from "@/config/adNetworks";

/**
 * Central ad placement configuration.
 *
 * RULE: On any single page, each AdUnitKey may appear at most once.
 * Reusing the same Adsterra banner key twice = blank gray slots.
 */

export type AdPlacementId =
  | "top-banner"
  | "after-video"
  | "after-title"
  | "after-recommended"
  | "sidebar-1"
  | "sidebar-2"
  | "mobile-inline-1"
  | "home-leaderboard"
  | "home-strip"
  | "home-mid-banner"
  | "home-mid-rect"
  | "home-sidebar"
  | "home-sidebar-2";

export interface AdPlacement {
  id: AdPlacementId;
  unitKey: AdUnitKey;
  width: number;
  height: number;
  sticky?: boolean;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  className?: string;
}

/**
 * All 6 banner sizes from Adsterra dashboard, mapped once for homepage
 * and once (different placement IDs, same keys) for article pages.
 * Homepage and article are separate pages so keys can repeat across routes.
 */
export const adPlacements: AdPlacement[] = [
  // —— Article / shared ——
  {
    id: "top-banner",
    unitKey: "728x90",
    width: 728,
    height: 90,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    id: "after-video",
    unitKey: "300x250",
    width: 300,
    height: 250,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    id: "after-title",
    unitKey: "468x60",
    width: 468,
    height: 60,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    id: "after-recommended",
    unitKey: "320x50",
    width: 320,
    height: 50,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    id: "sidebar-1",
    unitKey: "160x600",
    width: 160,
    height: 600,
    showOnMobile: false,
    showOnDesktop: true,
  },
  {
    id: "sidebar-2",
    unitKey: "160x300",
    width: 160,
    height: 300,
    sticky: true,
    showOnMobile: false,
    showOnDesktop: true,
  },
  {
    id: "mobile-inline-1",
    unitKey: "320x50",
    width: 320,
    height: 50,
    showOnMobile: true,
    showOnDesktop: false,
  },

  // —— Homepage (each size exactly once) ——
  {
    id: "home-leaderboard",
    unitKey: "728x90",
    width: 728,
    height: 90,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    id: "home-strip",
    unitKey: "320x50",
    width: 320,
    height: 50,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    id: "home-mid-banner",
    unitKey: "468x60",
    width: 468,
    height: 60,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    id: "home-mid-rect",
    unitKey: "300x250",
    width: 300,
    height: 250,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    id: "home-sidebar",
    unitKey: "160x600",
    width: 160,
    height: 600,
    showOnMobile: false,
    showOnDesktop: true,
  },
  {
    id: "home-sidebar-2",
    unitKey: "160x300",
    width: 160,
    height: 300,
    sticky: true,
    showOnMobile: false,
    showOnDesktop: true,
  },
];

const placementMap = new Map(adPlacements.map((p) => [p.id, p]));

export function getAdPlacement(id: AdPlacementId): AdPlacement {
  const placement = placementMap.get(id);
  if (!placement) {
    throw new Error(`Unknown ad placement: ${id}`);
  }
  return placement;
}

/** Article sidebar — unique keys only (no 300x250; that is after-video). */
export const sidebarAdIds: AdPlacementId[] = ["sidebar-1"];

export const stickySidebarAdIds: AdPlacementId[] = ["sidebar-2"];

export const mobileInlineAdIds: AdPlacementId[] = ["mobile-inline-1"];

/** No in-article paragraph ads — avoids reusing banner keys. */
export const inArticleAdIds: AdPlacementId[] = [];

export const infiniteScrollConfig = {
  initialBatchSize: 6,
  loadMoreBatchSize: 6,
  adEveryPosts: 3,
  adBetweenBatches: false,
  mobileAdEveryPosts: 4,
};

export function getInfiniteFeedAdId(
  batchIndex: number,
  slotIndex: number
): string {
  return `infinite-feed-b${batchIndex}-s${slotIndex}`;
}

export function getInfiniteMobileAdId(
  batchIndex: number,
  slotIndex: number
): string {
  return `infinite-mobile-b${batchIndex}-s${slotIndex}`;
}

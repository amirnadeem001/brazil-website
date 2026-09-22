/**
 * Adsterra ad units — single source of truth for all ad scripts on the site.
 *
 * Change keys, URLs, or smartlink here only; placements in config/ads.ts pick sizes by name.
 *
 * Too many ads can hurt user experience, SEO, and ad network approval. Use placements carefully.
 */

export type AdUnitKey =
  | "160x300"
  | "160x600"
  | "300x250"
  | "320x50"
  | "468x60"
  | "728x90";

export interface IframeAdUnitConfig {
  type: "iframe";
  key: string;
  width: number;
  height: number;
  invokeUrl: string;
}

export interface NativeBannerConfig {
  type: "native";
  scriptUrl: string;
  containerId: string;
}

export type GlobalScriptPlacement = "head" | "body-end";

export interface GlobalScriptConfig {
  id: string;
  src: string;
  strategy: "afterInteractive" | "lazyOnload";
  placement: GlobalScriptPlacement;
  async?: boolean;
  cfasync?: boolean;
}

/** Smartlink — use as href on monetized outbound links (standard <a> tags). */
export const adsterraSmartlink =
  "https://www.profitableratecpmnetwork.com/p4z5ck7k?key=48aca2d0b771cbdeac30e7a57618c0d1";

/** Banner 160×300 */
export const iframeAdUnits: Record<AdUnitKey, IframeAdUnitConfig> = {
  "160x300": {
    type: "iframe",
    key: "9fd4021a87555921ecbf11a276ee2e7c",
    width: 160,
    height: 300,
    invokeUrl:
      "https://www.highrevenueformat.com/9fd4021a87555921ecbf11a276ee2e7c/invoke.js",
  },
  /** Banner 160×600 */
  "160x600": {
    type: "iframe",
    key: "7f4e36aa5d00ed3e47252f6c26d65662",
    width: 160,
    height: 600,
    invokeUrl:
      "https://www.highrevenueformat.com/7f4e36aa5d00ed3e47252f6c26d65662/invoke.js",
  },
  /** Banner 300×250 */
  "300x250": {
    type: "iframe",
    key: "f718924692cdfb81435b2f37ec0f9c91",
    width: 300,
    height: 250,
    invokeUrl:
      "https://www.highrevenueformat.com/f718924692cdfb81435b2f37ec0f9c91/invoke.js",
  },
  /** Banner 320×50 */
  "320x50": {
    type: "iframe",
    key: "f3e38f730496676516903bf6914129b0",
    width: 320,
    height: 50,
    invokeUrl:
      "https://www.highrevenueformat.com/f3e38f730496676516903bf6914129b0/invoke.js",
  },
  /** Banner 468×60 */
  "468x60": {
    type: "iframe",
    key: "48245a33d3bf942ac4dfa1ff65b0aadd",
    width: 468,
    height: 60,
    invokeUrl:
      "https://www.highrevenueformat.com/48245a33d3bf942ac4dfa1ff65b0aadd/invoke.js",
  },
  /** Banner 728×90 */
  "728x90": {
    type: "iframe",
    key: "b642601e00b8bea103701ef034e2f6fc",
    width: 728,
    height: 90,
    invokeUrl:
      "https://www.highrevenueformat.com/b642601e00b8bea103701ef034e2f6fc/invoke.js",
  },
};

/** Native Banner — place anywhere in page body */
export const nativeBannerConfig: NativeBannerConfig = {
  type: "native",
  scriptUrl:
    "https://pl31465166.profitableratecpmnetwork.com/5c169ce017aee48135f8572bcf38b77c/invoke.js",
  containerId: "container-5c169ce017aee48135f8572bcf38b77c",
};

/** Popunder (before </head>) and Social Bar (before </body>) */
export const globalAdScripts: GlobalScriptConfig[] = [
  {
    id: "popunder",
    src: "https://pl31465165.profitableratecpmnetwork.com/c0/83/05/c083051f93e425cf3cd76eebce9ae530.js",
    strategy: "lazyOnload",
    placement: "head",
  },
  {
    id: "social-bar",
    src: "https://pl31465168.profitableratecpmnetwork.com/00/9e/51/009e51fd8ca5c9ee619e7ea42ee0e97a.js",
    strategy: "afterInteractive",
    placement: "body-end",
  },
];

/** Wide units only — narrow skyscrapers belong in the sidebar, not the feed grid. */
export const infiniteFeedAdUnits: AdUnitKey[] = [
  "728x90",
  "468x60",
  "300x250",
];

export const infiniteMobileAdUnits: AdUnitKey[] = ["320x50", "300x250"];

/** Feed grid: wide banners span both columns; rectangles sit in one cell. */
export function isWideFeedAdUnit(key: AdUnitKey): boolean {
  return iframeAdUnits[key].width > 320;
}

export function getIframeAdUnit(key: AdUnitKey): IframeAdUnitConfig {
  return iframeAdUnits[key];
}

export function getInfiniteFeedAdUnit(
  batchIndex: number,
  slotIndex: number,
  mobile = false
): AdUnitKey {
  const pool = mobile ? infiniteMobileAdUnits : infiniteFeedAdUnits;
  return pool[(batchIndex * 3 + slotIndex) % pool.length];
}

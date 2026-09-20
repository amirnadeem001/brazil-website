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
  "https://www.effectivecpmnetwork.com/qvjdte4jjb?key=4a8937e8d299e428643d5fb216e3ac63";

/** Banner 160×300 */
export const iframeAdUnits: Record<AdUnitKey, IframeAdUnitConfig> = {
  "160x300": {
    type: "iframe",
    key: "3bbf63c8f60758200cb25ee94044597a",
    width: 160,
    height: 300,
    invokeUrl:
      "https://www.highperformanceformat.com/3bbf63c8f60758200cb25ee94044597a/invoke.js",
  },
  /** Banner 160×600 */
  "160x600": {
    type: "iframe",
    key: "26cafa57c268e80e1115b4378473dec8",
    width: 160,
    height: 600,
    invokeUrl:
      "https://www.highperformanceformat.com/26cafa57c268e80e1115b4378473dec8/invoke.js",
  },
  /** Banner 300×250 */
  "300x250": {
    type: "iframe",
    key: "4dc6a8390fdaa8af68c1ef6da70a5df0",
    width: 300,
    height: 250,
    invokeUrl:
      "https://www.highperformanceformat.com/4dc6a8390fdaa8af68c1ef6da70a5df0/invoke.js",
  },
  /** Banner 320×50 */
  "320x50": {
    type: "iframe",
    key: "2b59ad6566865ccaa52d80fe705bec8f",
    width: 320,
    height: 50,
    invokeUrl:
      "https://www.highperformanceformat.com/2b59ad6566865ccaa52d80fe705bec8f/invoke.js",
  },
  /** Banner 468×60 */
  "468x60": {
    type: "iframe",
    key: "38b16bde924d34d9f811df73f6e86715",
    width: 468,
    height: 60,
    invokeUrl:
      "https://www.highperformanceformat.com/38b16bde924d34d9f811df73f6e86715/invoke.js",
  },
  /** Banner 728×90 */
  "728x90": {
    type: "iframe",
    key: "d2a8d425e2e5e5ab6586488ecfeff4b5",
    width: 728,
    height: 90,
    invokeUrl:
      "https://www.highperformanceformat.com/d2a8d425e2e5e5ab6586488ecfeff4b5/invoke.js",
  },
};

/** Native Banner — place anywhere in page body */
export const nativeBannerConfig: NativeBannerConfig = {
  type: "native",
  scriptUrl:
    "https://pl29446738.effectivecpmnetwork.com/c308b3e082e11aec465d3cbb34b6ca11/invoke.js",
  containerId: "container-c308b3e082e11aec465d3cbb34b6ca11",
};

/** Popunder (before </head>) and Social Bar (before </body>) */
export const globalAdScripts: GlobalScriptConfig[] = [
  {
    id: "popunder",
    src: "https://pl29446737.effectivecpmnetwork.com/58/29/c7/5829c7bf114cc21e4a3d334e87e4e5ae.js",
    strategy: "lazyOnload",
    placement: "head",
  },
  {
    id: "social-bar",
    src: "https://pl29446740.effectivecpmnetwork.com/c1/a5/3c/c1a53ccd5e7e3e7d13ffc839064109a2.js",
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

"use client";

import type { IframeAdUnitConfig } from "@/config/adNetworks";
import { buildIframeAdSrcDoc } from "@/lib/adLoader";

interface IframeAdUnitProps {
  unit: IframeAdUnitConfig;
  containerId: string;
}

/**
 * Each banner runs in its own srcDoc iframe so window.atOptions cannot
 * race across placements (the usual cause of blank Adsterra slots in React).
 *
 * Do NOT set loading="lazy" here — AdSlot already defers mount via
 * IntersectionObserver. Native iframe lazy + srcDoc often yields blank ads.
 */
export default function IframeAdUnit({ unit, containerId }: IframeAdUnitProps) {
  return (
    <iframe
      id={containerId}
      title="Publicidade"
      srcDoc={buildIframeAdSrcDoc(unit)}
      width={unit.width}
      height={unit.height}
      scrolling="no"
      frameBorder={0}
      referrerPolicy="no-referrer-when-downgrade"
      style={{
        display: "block",
        width: unit.width,
        height: unit.height,
        maxWidth: "100%",
        margin: "0 auto",
        border: 0,
        overflow: "hidden",
        background: "transparent",
      }}
    />
  );
}

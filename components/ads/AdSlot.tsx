"use client";

import { useEffect, useRef, useState } from "react";
import type { AdUnitKey } from "@/config/adNetworks";
import { getIframeAdUnit } from "@/config/adNetworks";
import { buildIframeAdSrcDoc } from "@/lib/adLoader";

export interface AdSlotProps {
  id: string;
  unitKey: AdUnitKey;
  width?: number;
  height?: number;
  className?: string;
  sticky?: boolean;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
  eager?: boolean;
}

function visibilityClasses(
  showOnMobile?: boolean,
  showOnDesktop?: boolean
): string {
  if (showOnMobile === false && showOnDesktop !== false) {
    return "hidden md:block";
  }
  if (showOnDesktop === false && showOnMobile !== false) {
    return "md:hidden";
  }
  return "";
}

/**
 * Isolated Adsterra banner (srcDoc iframe = private window.atOptions).
 * No gray placeholder boxes — empty inventory stays transparent.
 */
export default function AdSlot({
  id,
  unitKey,
  width,
  height,
  className = "",
  sticky = false,
  showOnMobile = true,
  showOnDesktop = true,
  eager = false,
}: AdSlotProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(eager);
  const unit = getIframeAdUnit(unitKey);
  const slotW = width ?? unit.width;
  const slotH = height ?? unit.height;

  useEffect(() => {
    if (eager) {
      setIsVisible(true);
      return;
    }
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <aside
      ref={containerRef}
      className={[
        "ad-slot w-full",
        visibilityClasses(showOnMobile, showOnDesktop),
        sticky ? "sticky top-4 z-10" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Publicidade"
      data-ad-placement={id}
      data-ad-unit={unitKey}
    >
      <div
        className="relative mx-auto flex items-center justify-center overflow-hidden bg-transparent"
        style={{
          width: slotW,
          maxWidth: "100%",
          minHeight: isVisible ? slotH : 0,
          height: isVisible ? slotH : 0,
        }}
      >
        {isVisible ? (
          <iframe
            id={`ad-container-${id}`}
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
        ) : null}
      </div>
    </aside>
  );
}

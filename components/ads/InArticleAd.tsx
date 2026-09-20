"use client";

import AdSlot from "@/components/ads/AdSlot";
import { getAdPlacement, type AdPlacementId } from "@/config/ads";

interface ConfiguredAdProps {
  placementId: AdPlacementId;
  className?: string;
}

export default function InArticleAd({ placementId, className }: ConfiguredAdProps) {
  const placement = getAdPlacement(placementId);

  return (
    <AdSlot
      id={placement.id}
      unitKey={placement.unitKey}
      width={placement.width}
      height={placement.height}
      showOnMobile={placement.showOnMobile}
      showOnDesktop={placement.showOnDesktop}
      className={`my-6 ${className ?? ""}`}
    />
  );
}

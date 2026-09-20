"use client";

import AdSlot from "@/components/ads/AdSlot";
import { getAdPlacement, type AdPlacementId } from "@/config/ads";

interface ResponsiveAdBoxProps {
  placementId: AdPlacementId;
  className?: string;
  eager?: boolean;
}

export default function ResponsiveAdBox({
  placementId,
  className,
  eager = false,
}: ResponsiveAdBoxProps) {
  const placement = getAdPlacement(placementId);

  return (
    <AdSlot
      id={placement.id}
      unitKey={placement.unitKey}
      width={placement.width}
      height={placement.height}
      sticky={placement.sticky}
      showOnMobile={placement.showOnMobile}
      showOnDesktop={placement.showOnDesktop}
      className={className}
      eager={eager}
    />
  );
}

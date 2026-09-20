"use client";

import AdSlot from "@/components/ads/AdSlot";
import {
  getInfiniteFeedAdUnit,
  getIframeAdUnit,
} from "@/config/adNetworks";

interface FeedAdProps {
  id: string;
  batchIndex: number;
  slotIndex: number;
  mobile?: boolean;
  className?: string;
}

export default function FeedAd({
  id,
  batchIndex,
  slotIndex,
  mobile = false,
  className,
}: FeedAdProps) {
  const unitKey = getInfiniteFeedAdUnit(batchIndex, slotIndex, mobile);
  const unit = getIframeAdUnit(unitKey);

  return (
    <AdSlot
      id={id}
      unitKey={unitKey}
      width={unit.width}
      height={unit.height}
      showOnMobile={mobile}
      showOnDesktop={!mobile}
      className={className}
    />
  );
}

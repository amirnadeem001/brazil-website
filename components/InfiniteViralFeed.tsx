"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FeedAd from "@/components/ads/FeedAd";
import ViralPostCard from "@/components/ViralPostCard";
import {
  getInfiniteFeedAdId,
  getInfiniteMobileAdId,
  infiniteScrollConfig,
} from "@/config/ads";
import { getInfiniteFeedAdUnit, isWideFeedAdUnit } from "@/config/adNetworks";
import { getPostsPage } from "@/lib/posts";
import type { Post } from "@/types/post";

interface FeedItem {
  key: string;
  type: "post" | "ad" | "mobile-ad";
  post?: Post;
  adId?: string;
  batchIndex?: number;
  slotIndex?: number;
  variant?: "default" | "large";
}

interface InfiniteViralFeedProps {
  excludeSlug: string;
  initialPosts: Post[];
}

function buildBatchItems(
  posts: Post[],
  batchIndex: number,
  globalPostOffset: number
): FeedItem[] {
  const items: FeedItem[] = [];
  let adSlotIndex = 0;
  let mobileAdSlotIndex = 0;

  posts.forEach((post, index) => {
    const globalIndex = globalPostOffset + index;

    items.push({
      key: `post-${batchIndex}-${post.slug}-${index}`,
      type: "post",
      post,
      variant: globalIndex % 4 === 0 ? "large" : "default",
    });

    const postNumberInBatch = index + 1;

    if (postNumberInBatch % infiniteScrollConfig.adEveryPosts === 0) {
      items.push({
        key: `ad-${batchIndex}-${adSlotIndex}`,
        type: "ad",
        adId: getInfiniteFeedAdId(batchIndex, adSlotIndex),
        batchIndex,
        slotIndex: adSlotIndex,
      });
      adSlotIndex++;
    }

    if (
      infiniteScrollConfig.mobileAdEveryPosts > 0 &&
      postNumberInBatch % infiniteScrollConfig.mobileAdEveryPosts === 0
    ) {
      items.push({
        key: `mobile-ad-${batchIndex}-${mobileAdSlotIndex}`,
        type: "mobile-ad",
        adId: getInfiniteMobileAdId(batchIndex, mobileAdSlotIndex),
        batchIndex,
        slotIndex: mobileAdSlotIndex,
      });
      mobileAdSlotIndex++;
    }
  });

  if (infiniteScrollConfig.adBetweenBatches && batchIndex > 0) {
    items.push({
      key: `batch-ad-${batchIndex}`,
      type: "ad",
      adId: getInfiniteFeedAdId(batchIndex, adSlotIndex),
      batchIndex,
      slotIndex: adSlotIndex,
    });
  }

  return items;
}

function feedAdColSpan(batchIndex: number, slotIndex: number, mobile: boolean) {
  const unitKey = getInfiniteFeedAdUnit(batchIndex, slotIndex, mobile);
  return isWideFeedAdUnit(unitKey) ? "col-span-1 sm:col-span-2" : "col-span-1";
}

/**
 * Too many ads can hurt user experience, SEO, and ad network approval. Use placements carefully.
 */
export default function InfiniteViralFeed({
  excludeSlug,
  initialPosts,
}: InfiniteViralFeedProps) {
  const [items, setItems] = useState<FeedItem[]>(() =>
    buildBatchItems(initialPosts, 0, 0)
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const totalPostsLoaded = useRef(initialPosts.length);

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    window.setTimeout(() => {
      const nextPosts = getPostsPage(
        page,
        infiniteScrollConfig.loadMoreBatchSize,
        excludeSlug
      );

      if (nextPosts.length === 0) {
        setHasMore(false);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      const batchItems = buildBatchItems(
        nextPosts,
        page,
        totalPostsLoaded.current
      );

      totalPostsLoaded.current += nextPosts.length;
      setItems((current) => [...current, ...batchItems]);
      setPage((current) => current + 1);
      setLoading(false);
      loadingRef.current = false;
    }, 400);
  }, [excludeSlug, page]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <section aria-label="Posts em destaque" className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => {
          if (item.type === "post" && item.post) {
            return (
              <ViralPostCard
                key={item.key}
                post={item.post}
                variant={item.variant}
                className={
                  item.variant === "large" ? "col-span-1 sm:col-span-2" : undefined
                }
              />
            );
          }

          if (item.type === "ad" && item.adId) {
            const span = feedAdColSpan(
              item.batchIndex ?? 0,
              item.slotIndex ?? 0,
              false
            );
            return (
              <div key={item.key} className={span}>
                <FeedAd
                  id={item.adId}
                  batchIndex={item.batchIndex ?? 0}
                  slotIndex={item.slotIndex ?? 0}
                />
              </div>
            );
          }

          if (item.type === "mobile-ad" && item.adId) {
            const span = feedAdColSpan(
              item.batchIndex ?? 0,
              item.slotIndex ?? 0,
              true
            );
            return (
              <div key={item.key} className={`md:hidden ${span}`}>
                <FeedAd
                  id={item.adId}
                  batchIndex={item.batchIndex ?? 0}
                  slotIndex={item.slotIndex ?? 0}
                  mobile
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      <div ref={sentinelRef} className="py-2" aria-hidden={!hasMore}>
        {loading ? (
          <p className="text-center text-sm text-gray-500">
            Carregando mais histórias...
          </p>
        ) : hasMore ? (
          <p className="text-center text-xs text-gray-400">
            Role para ver mais histórias
          </p>
        ) : (
          <p className="text-center text-xs text-gray-400">
            Você chegou ao fim
          </p>
        )}
      </div>
    </section>
  );
}

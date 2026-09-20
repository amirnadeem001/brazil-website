"use client";

import { useEffect, useRef } from "react";
import { nativeBannerConfig } from "@/config/adNetworks";

/**
 * Too many ads can hurt user experience, SEO, and ad network approval. Use placements carefully.
 */
export default function NativeBannerAd() {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    if (document.getElementById(`native-script-${nativeBannerConfig.containerId}`)) {
      loadedRef.current = true;
      return;
    }

    loadedRef.current = true;
    const script = document.createElement("script");
    script.id = `native-script-${nativeBannerConfig.containerId}`;
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = nativeBannerConfig.scriptUrl;
    document.body.appendChild(script);
  }, []);

  return (
    <aside className="my-4 w-full overflow-hidden" aria-label="Publicidade">
      <div className="mx-auto min-h-[90px] w-full max-w-full">
        <div id={nativeBannerConfig.containerId} />
      </div>
    </aside>
  );
}

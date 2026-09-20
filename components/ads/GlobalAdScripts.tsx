import Script from "next/script";
import { globalAdScripts } from "@/config/adNetworks";

function renderScript(script: (typeof globalAdScripts)[number]) {
  return (
    <Script
      key={script.id}
      id={`global-ad-${script.id}`}
      src={script.src}
      strategy={script.strategy}
    />
  );
}

/** Popunder — load before </head> (see adNetworks.ts). */
export function GlobalHeadAdScripts() {
  return (
    <>
      {globalAdScripts
        .filter((script) => script.placement === "head")
        .map(renderScript)}
    </>
  );
}

/** Social Bar — load before </body> (see adNetworks.ts). */
export function GlobalBodyAdScripts() {
  return (
    <>
      {globalAdScripts
        .filter((script) => script.placement === "body-end")
        .map(renderScript)}
    </>
  );
}

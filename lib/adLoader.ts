import type { IframeAdUnitConfig } from "@/config/adNetworks";

/**
 * Build an isolated srcDoc document for one Adsterra iframe unit.
 * Matches Adsterra's official atOptions shape (quoted keys).
 */
export function buildIframeAdSrcDoc(unit: IframeAdUnitConfig): string {
  const options = JSON.stringify({
    key: unit.key,
    format: "iframe",
    height: unit.height,
    width: unit.width,
    params: {},
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${unit.width}">
<style>
  html,body{margin:0;padding:0;width:${unit.width}px;height:${unit.height}px;overflow:hidden;background:transparent;}
</style>
</head>
<body>
<script>window.atOptions=${options};</script>
<script src="${unit.invokeUrl}"></script>
</body>
</html>`;
}

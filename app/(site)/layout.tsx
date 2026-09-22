import type { Metadata } from "next";
import {
  GlobalBodyAdScripts,
  GlobalHeadAdScripts,
} from "@/components/ads/GlobalAdScripts";

export const metadata: Metadata = {
  title: {
    default: "contosdobrasil — Histórias Reais, Beleza e Moda",
    template: "%s | contosdobrasil",
  },
  description:
    "Histórias reais, looks de beleza, moda e momentos de confiança que todo mundo está salvando agora.",
  other: {
    "p:domain_verify": "f0ff3788a1420a45218de0692d075723",
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <GlobalHeadAdScripts />
      {children}
      <GlobalBodyAdScripts />
    </>
  );
}

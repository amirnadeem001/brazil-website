import SidebarAd from "@/components/ads/SidebarAd";
import StickyAdSlot from "@/components/ads/StickyAdSlot";
import { sidebarAdIds, stickySidebarAdIds } from "@/config/ads";

interface SidebarProps {
  showAbout?: boolean;
}

/**
 * Too many ads can hurt user experience, SEO, and ad network approval. Use placements carefully.
 */
export default function Sidebar({ showAbout = true }: SidebarProps) {
  return (
    <aside
      className="w-full shrink-0 space-y-4 md:w-[300px] lg:w-[320px]"
      aria-label="Barra lateral"
    >
      {showAbout ? (
        <section className="rounded border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-bold text-black">Sobre nós</h2>
          <p className="text-xs leading-relaxed text-gray-600">
            O contosdobrasil traz histórias reais, looks de beleza, moda e
            conteúdos de confiança que as meninas não param de compartilhar.
            Fique pelos glow-ups, looks e energia de pele real de que todo mundo
            está falando.
          </p>
          <nav className="mt-3 space-y-1" aria-label="Links do rodapé">
            <a href="#" className="block text-xs text-orange-600 hover:underline">
              Contato
            </a>
            <a href="#" className="block text-xs text-orange-600 hover:underline">
              Política de Privacidade
            </a>
            <a href="#" className="block text-xs text-orange-600 hover:underline">
              Termos de Serviço
            </a>
          </nav>
        </section>
      ) : null}

      <div className="hidden space-y-3 md:block">
        {sidebarAdIds.map((id) => (
          <SidebarAd key={id} placementId={id} />
        ))}

        <div className="sticky top-4 z-10 space-y-3">
          {stickySidebarAdIds.map((id) => (
            <StickyAdSlot key={id} placementId={id} />
          ))}
        </div>
      </div>
    </aside>
  );
}

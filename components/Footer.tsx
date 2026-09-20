import Link from "next/link";

const FOOTER_COLS = [
  {
    title: "Empresa",
    links: ["Sobre nós", "Contato", "Carreiras", "Anuncie"],
  },
  {
    title: "Explorar",
    links: ["Celebridades", "Beleza", "Estilo", "Estilo de vida"],
  },
  {
    title: "Legal",
    links: ["Política de Privacidade", "Termos de Serviço", "Política de Cookies"],
  },
] as const;

export default function Footer() {
  return (
    <footer className="mt-12 bg-neutral-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="text-2xl font-black tracking-tight text-white">
            justtrue<span className="text-orange-400">fans</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-300">
            Histórias reais, looks de beleza e momentos de confiança que todo
            mundo está salvando agora.
          </p>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              {col.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-sm text-neutral-300 hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} justtruefans. Todos os direitos
            reservados.
          </p>
          <p className="text-xs text-neutral-500">
            Para entretenimento e inspiração. Links de afiliados podem gerar
            comissão.
          </p>
        </div>
      </div>
    </footer>
  );
}

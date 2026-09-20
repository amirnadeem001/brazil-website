import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f4f6] px-4">
      <h1 className="text-2xl font-bold text-black">Artigo não encontrado</h1>
      <p className="mt-2 text-sm text-gray-600">
        A história que você procura não existe.
      </p>
      <Link
        href="/"
        className="mt-4 rounded bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
      >
        Voltar ao início
      </Link>
    </div>
  );
}

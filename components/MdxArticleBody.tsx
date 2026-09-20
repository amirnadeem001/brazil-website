import type { ReactNode } from "react";
import Image from "next/image";
import { compileMDX } from "next-mdx-remote/rsc";

interface MdxArticleBodyProps {
  source: string;
}

const mdxComponents = {
  p: ({ children }: { children?: ReactNode }) => (
    <p className="text-[15px] leading-7 text-gray-800">{children}</p>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="pt-2 font-serif text-xl font-bold leading-snug text-black">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="pt-1 text-lg font-bold leading-snug text-black">{children}</h3>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc space-y-1 pl-5 text-[15px] leading-7 text-gray-800">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="list-decimal space-y-1 pl-5 text-[15px] leading-7 text-gray-800">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-black">{children}</strong>
  ),
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    if (!src) return null;

    return (
      <figure className="overflow-hidden bg-gray-100">
        <div className="relative aspect-square w-full sm:aspect-[4/5]">
          <Image
            src={src}
            alt={alt || ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </div>
      </figure>
    );
  },
};

export default async function MdxArticleBody({ source }: MdxArticleBodyProps) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
  });

  return <article className="prose-article space-y-4">{content}</article>;
}

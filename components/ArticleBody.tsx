import Image from "next/image";
import type { InlineImage } from "@/types/post";

interface ArticleBodyProps {
  paragraphs: string[];
  inlineImages?: InlineImage[];
}

export default function ArticleBody({
  paragraphs,
  inlineImages = [],
}: ArticleBodyProps) {
  const imagesByParagraph = new Map<number, InlineImage[]>();
  for (const image of inlineImages) {
    const list = imagesByParagraph.get(image.afterParagraph) ?? [];
    list.push(image);
    imagesByParagraph.set(image.afterParagraph, list);
  }

  return (
    <article className="prose-article space-y-4">
      {paragraphs.map((paragraph, index) => {
        const paragraphNumber = index + 1;
        const images = imagesByParagraph.get(paragraphNumber) ?? [];

        return (
          <div key={index} className="space-y-4">
            <p className="text-[15px] leading-7 text-gray-800">{paragraph}</p>

            {images.map((image) => (
              <figure
                key={image.src}
                className="overflow-hidden bg-gray-100"
              >
                <div className="relative aspect-square w-full sm:aspect-[4/5]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 720px"
                  />
                </div>
              </figure>
            ))}
          </div>
        );
      })}
    </article>
  );
}

"use client";

import type { ReactNode } from "react";

interface ArticleBodyPreviewProps {
  source: string;
}

const IMAGE_PATTERN = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const HEADING_PATTERN = /^(#{1,3})\s+(.+)$/;
const UNORDERED_PATTERN = /^[-*]\s+/;

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return <strong key={index}>{bold[1]}</strong>;
    }

    const italic = part.match(/^\*([^*]+)\*$/);
    if (italic) {
      return <em key={index}>{italic[1]}</em>;
    }

    const code = part.match(/^`([^`]+)`$/);
    if (code) {
      return <code key={index}>{code[1]}</code>;
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a key={index} href={link[2]} className="underline">
          {link[1]}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="overflow-hidden bg-gray-100">
      <div className="relative aspect-square w-full sm:aspect-[4/5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
    </figure>
  );
}

export default function ArticleBodyPreview({ source }: ArticleBodyPreviewProps) {
  const blocks = source
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return (
      <p className="text-sm text-neutral-500">Start writing to see a preview.</p>
    );
  }

  return (
    <article className="prose-article space-y-4">
      {blocks.map((block, index) => {
        const image = block.match(IMAGE_PATTERN);
        if (image) {
          return <PreviewImage key={index} alt={image[1]} src={image[2]} />;
        }

        const heading = block.match(HEADING_PATTERN);
        if (heading) {
          const level = heading[1].length;
          const className = "font-bold text-neutral-900";
          if (level === 1) {
            return (
              <h2 key={index} className={`text-2xl ${className}`}>
                {renderInline(heading[2])}
              </h2>
            );
          }
          if (level === 2) {
            return (
              <h3 key={index} className={`text-xl ${className}`}>
                {renderInline(heading[2])}
              </h3>
            );
          }
          return (
            <h4 key={index} className={`text-lg ${className}`}>
              {renderInline(heading[2])}
            </h4>
          );
        }

        const lines = block.split("\n");
        if (lines.every((line) => UNORDERED_PATTERN.test(line))) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5 text-[15px] leading-7 text-gray-800">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>{renderInline(line.replace(UNORDERED_PATTERN, ""))}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="text-[15px] leading-7 text-gray-800">
            {renderInline(block.replace(/\n/g, " "))}
          </p>
        );
      })}
    </article>
  );
}

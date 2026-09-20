interface ArticleHeroVideoProps {
  videoUrl?: string;
  featuredImage: string;
  title: string;
}

function isDirectMediaVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

export default function ArticleHeroVideo({
  videoUrl,
  featuredImage,
  title,
}: ArticleHeroVideoProps) {
  if (videoUrl && isDirectMediaVideo(videoUrl)) {
    return (
      <figure className="relative flex w-full items-center justify-center bg-neutral-100">
        <video
          src={videoUrl}
          poster={featuredImage}
          className="max-h-[85vh] w-full object-contain object-center"
          controls
          playsInline
          preload="metadata"
          aria-label={title}
        />
      </figure>
    );
  }

  if (videoUrl) {
    return (
      <figure className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={videoUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </figure>
    );
  }

  return (
    <figure className="relative flex w-full items-center justify-center bg-neutral-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={featuredImage}
        alt={title}
        className="max-h-[85vh] w-full object-contain object-center"
        loading="eager"
      />
    </figure>
  );
}

interface SectionBannerProps {
  title: string;
  id?: string;
}

export default function SectionBanner({ title, id }: SectionBannerProps) {
  return (
    <div
      id={id}
      className="bg-black px-4 py-2.5 scroll-mt-4"
    >
      <h2 className="text-center text-sm font-bold uppercase tracking-[0.18em] text-white sm:text-left">
        {title}
      </h2>
    </div>
  );
}

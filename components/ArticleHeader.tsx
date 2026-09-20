interface ArticleHeaderProps {
  title: string;
  author: string;
  date: string;
  category: string;
}

export default function ArticleHeader({
  title,
  author,
  date,
  category,
}: ArticleHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="text-2xl font-bold leading-tight text-black sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      <p className="text-xs text-gray-500">
        <span>{date}</span>
        <span className="mx-2">|</span>
        <span>{category}</span>
        <span className="mx-2">|</span>
        <span>Por {author}</span>
      </p>
    </header>
  );
}

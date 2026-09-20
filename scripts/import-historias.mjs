import fs from "node:fs";
import path from "node:path";

const sourcePath =
  process.argv[2] ||
  "C:/Users/amirn/Downloads/historias-todos-os-artigos.md";
const blogDir = "D:/brazil/content/blog";
const imagesDir = "D:/brazil/public/images";

const raw = fs.readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatPostDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function excerptFromBody(body) {
  const first =
    body
      .split(/\n\n+/)
      .map((p) => p.trim())
      .find(Boolean) || "";
  const clean = first.replace(/\s+/g, " ").trim();
  if (clean.length <= 180) return clean;
  return clean.slice(0, 177).replace(/\s+\S*$/, "") + "...";
}

function yamlEscape(s) {
  return JSON.stringify(s);
}

const parts = raw.split(/\n(?=## \d+\. )/);
const articles = [];

for (const part of parts) {
  const m = part.match(/^## (\d+)\.\s+(.+)\n/);
  if (!m) continue;

  const num = Number(m[1]);
  const title = m[2].trim();
  const labelMatch = part.match(
    /\*\*Label:\*\*\s*(.+?)\s*\|\s*\*\*Publicado:\*\*\s*(\d{4}-\d{2}-\d{2})/
  );
  if (!labelMatch) {
    console.error("Missing meta for", title);
    continue;
  }

  const category = labelMatch[1].trim();
  const isoDate = labelMatch[2].trim();
  let body = part
    .replace(/^## \d+\.\s+.+\n/, "")
    .replace(/\*\*Label:\*\*.+\n/, "")
    .replace(/\*\*URL:\*\*.+\n/, "")
    .trim()
    .replace(/\n---\s*$/, "")
    .trim();

  articles.push({
    num,
    title,
    category,
    isoDate,
    body,
    slug: slugifyTitle(title),
  });
}

if (articles.length === 0) {
  console.error("No articles parsed — aborting without deleting files.");
  process.exit(1);
}

console.log(`Parsed ${articles.length} articles`);

const images = fs
  .readdirSync(imagesDir)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .filter(
    (f) =>
      !/whatsapp|spider|susu|file\.|globe|next|vercel|window/i.test(f)
  )
  .sort();

const preferred = images.filter((f) =>
  /empty-seat|never-kissed|places-untouched|untouched|paris|yacht|beach|healthy|castor|japandi|designer|sore|aging|smile|belly|digestive|peach|vitamin|purple|pickle|home-look|aloe/i.test(
    f
  )
);
const imagePool = preferred.length >= 12 ? preferred : images;

const byCategory = new Map();
for (const a of articles) {
  if (!byCategory.has(a.category)) byCategory.set(a.category, []);
  byCategory.get(a.category).push(a);
}

fs.mkdirSync(blogDir, { recursive: true });
for (const f of fs.readdirSync(blogDir)) {
  if (f.endsWith(".mdx")) fs.unlinkSync(path.join(blogDir, f));
}

const usedSlugs = new Set();
for (let i = 0; i < articles.length; i++) {
  const a = articles[i];
  let slug = a.slug;
  if (usedSlugs.has(slug)) slug = `${slug}-${a.num}`;
  usedSlugs.add(slug);
  a.slug = slug;

  const sameCat = byCategory
    .get(a.category)
    .filter((x) => x.num !== a.num);
  const others = articles.filter((x) => x.num !== a.num);
  const related = [
    ...sameCat,
    ...others.filter((x) => !sameCat.includes(x)),
  ]
    .slice(0, 2)
    .map((x) => x.slug);

  const featuredImage = `/images/${imagePool[i % imagePool.length]}`;
  const date = formatPostDate(a.isoDate);
  const excerpt = excerptFromBody(a.body);

  const frontmatter = [
    "---",
    `id: ${yamlEscape(String(a.num))}`,
    `slug: ${yamlEscape(a.slug)}`,
    `title: ${yamlEscape(a.title)}`,
    `category: ${yamlEscape(a.category)}`,
    `author: ${yamlEscape("Equipe")}`,
    `date: ${yamlEscape(date)}`,
    `featuredImage: ${yamlEscape(featuredImage)}`,
    `excerpt: ${yamlEscape(excerpt)}`,
    "relatedSlugs:",
    ...related.map((s) => `  - ${yamlEscape(s)}`),
    "---",
    "",
    a.body,
    "",
  ].join("\n");

  fs.writeFileSync(path.join(blogDir, `${a.slug}.mdx`), frontmatter, "utf8");
}

// Second pass: relatedSlugs must use final slugs
for (let i = 0; i < articles.length; i++) {
  const a = articles[i];
  const sameCat = byCategory
    .get(a.category)
    .filter((x) => x.num !== a.num);
  const others = articles.filter((x) => x.num !== a.num);
  const related = [
    ...sameCat,
    ...others.filter((x) => !sameCat.includes(x)),
  ]
    .slice(0, 2)
    .map((x) => x.slug);

  const filePath = path.join(blogDir, `${a.slug}.mdx`);
  let content = fs.readFileSync(filePath, "utf8");
  content = content.replace(
    /relatedSlugs:\n(?:  - .+\n)*/,
    `relatedSlugs:\n${related.map((s) => `  - ${JSON.stringify(s)}`).join("\n")}\n`
  );
  fs.writeFileSync(filePath, content, "utf8");
}

console.log(`Wrote ${articles.length} mdx files to ${blogDir}`);
console.log(
  "Categories:",
  [...new Set(articles.map((a) => a.category))].join(", ")
);
console.log(
  articles.map((a) => `${a.num}. ${a.slug} [${a.category}]`).join("\n")
);

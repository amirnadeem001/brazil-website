import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const blogDir = "D:/brazil/content/blog";
const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"));
const required = [
  "id",
  "slug",
  "title",
  "category",
  "author",
  "date",
  "featuredImage",
  "excerpt",
];

let ok = 0;
for (const file of files) {
  const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
  const { data, content } = matter(raw);
  const missing = required.filter((k) => !data[k]);
  if (missing.length || !content.trim()) {
    console.error("Bad:", file, missing);
    process.exitCode = 1;
    continue;
  }
  ok++;
}

console.log(`Validated ${ok}/${files.length} MDX posts`);

const order = [
  "50-anos-depois-o-primeiro-amor-se-reencontrou-no-mesmo-banco-da-praca",
  "por-que-os-bebes-sorriem-enquanto-dormem-a-explicacao-vai-derreter-seu-coracao",
  "a-ligacao-que-dona-lucia-esperou-15-anos-para-receber",
  "o-terco-da-avo-a-oracao-que-atravessou-tres-geracoes",
  "por-que-um-abraco-faz-tao-bem-o-carinho-tambem-e-remedio",
  "a-vizinha-que-cuidava-de-todos-e-o-presente-que-recebeu-no-natal",
  "eles-se-casaram-aos-80-anos-a-festa-mais-linda-que-a-cidade-ja-viu",
  "aos-60-anos-ela-aprendeu-a-ler-e-escreveu-uma-carta-que-emocionou-a-todos",
  "o-bilhete-que-ela-encontrava-na-lancheira-todos-os-dias-durante-15-anos",
  "ela-vendeu-a-alianca-para-pagar-a-faculdade-do-filho-20-anos-depois-ele-a-surpre",
  "o-significado-emocionante-por-tras-dos-nomes-mais-amados-do-brasil",
  "a-cidade-brasileira-onde-todos-se-cumprimentam-pelo-nome",
  "por-que-a-comida-de-avo-e-mais-gostosa-a-ciencia-explica-o-segredo",
  "mae-de-5-filhos-revela-o-ritual-simples-que-manteve-a-familia-unida",
  "o-filho-que-ela-nao-pode-criar-voltou-para-conhece-la-aos-35-anos",
  "ela-adotou-4-irmaos-para-nao-separa-los-hoje-eles-a-chamam-de-mae",
  "o-pedido-de-casamento-que-aconteceu-25-anos-depois-do-primeiro-encontro",
  "ela-cuidou-dele-por-10-anos-a-carta-de-aniversario-comoveu-a-todos",
  "eles-se-conheceram-no-ponto-de-onibus-40-anos-depois-o-amor-so-cresceu",
  "a-ultima-mensagem-que-ele-deixou-antes-de-partir-mudou-a-familia-para-sempre",
  "ele-guardou-cartas-por-30-anos-o-que-a-familia-encontrou-comoveu-a-todos",
  "aos-72-anos-ela-tirou-a-carteira-de-motorista-e-realizou-o-sonho-da-vida",
  "o-segredo-das-avos-brasileiras-para-manter-a-familia-unida",
  "ela-encontrou-o-amor-verdadeiro-aos-58-anos-a-historia-que-emocionou-o-brasil",
  "7-sinais-de-que-seu-filho-sente-sua-falta-mesmo-sem-dizer-uma-palavra",
  "os-medicos-disseram-que-ele-nao-sobreviveria-hoje-ele-tem-5-anos-e-esbanja-alegr",
  "ele-a-deixou-apos-20-anos-de-casamento-o-que-ela-fez-depois-inspirou-milhares-de",
  "mae-solo-criou-3-filhos-sozinha-a-surpresa-que-ela-recebeu-aos-60-anos-vai-te-em",
];

const slugs = new Set(
  files.map((f) => f.replace(/\.mdx$/i, ""))
);
const missing = order.filter((s) => !slugs.has(s));
const extras = [...slugs].filter((s) => !order.includes(s));
console.log("Catalog missing:", missing.length ? missing.join(", ") : "none");
console.log("Extras:", extras.length ? extras.join(", ") : "none");

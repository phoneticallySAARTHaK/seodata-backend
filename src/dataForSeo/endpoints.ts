const baseUrl = "https://api.dataforseo.com/v3/on_page/";

export const apiPaths = {
  task_post: "task_post",
  summary: "summary",
  pages: "pages",
  pages_by_resource: "pages_by_resource",
  resources: "resources",
  duplicate_tags: "duplicate_tags",
  duplicate_content: "duplicate_content",
  links: "links",
  redirect_chains: "redirect_chains",
  non_indexable: "non_indexable",
  waterfall: "waterfall",
  keyword_density: "keyword_density",
  raw_html: "raw_html",
  lighthouse_live: "lighthouse/live/json",
} as const;

const mapped = Object.entries(apiPaths).map(([key, val]) => [
  key,
  `${baseUrl}${val}`,
]);

export const endpoints = Object.fromEntries(mapped) as Readonly<{
  [key in keyof typeof apiPaths]: `${typeof baseUrl}${(typeof apiPaths)[key]}`;
}>;

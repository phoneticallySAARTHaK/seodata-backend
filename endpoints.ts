const baseUrl = "https://api.dataforseo.com/v3/on_page/";

export const apiPaths = {
  task_post: "task_post",
  summary: "summary",
} as const;

const mapped = Object.entries(apiPaths).map(([key, val]) => [
  key,
  `${baseUrl}${val}`,
]);

export const endpoints = Object.fromEntries(mapped) as Readonly<{
  [key in keyof typeof apiPaths]: `https://${string}/${(typeof apiPaths)[key]}`;
}>;

console.log(endpoints);

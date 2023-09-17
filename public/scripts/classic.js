import { Loader, ResultHeading, snake_case_toSentence } from "./utils.js";

/**
 * Result Page Titles
 */
const resultPageNames = {
  summary: "Summary",
  pages: "Pages",
  resources: "Resources",
  links: "Links",
  redirectChains: "Redirect Chains",
  nonIndexable: "Non-indexable",
};

const _loaderArr = [
  [
    resultPageNames.summary,
    (id) => fetch(`/${getEndpoint(resultPageNames.summary)}/${id}`),
  ],
];

_loaderArr.push(
  ...Object.values(resultPageNames)
    .filter((val) => val !== resultPageNames.summary)
    .map((val) => [
      val,
      (id) =>
        fetch(`/${getEndpoint(val)}`, {
          method: "POST",
          headers: [["Content-Type", "application/json"]],
          body: JSON.stringify([{ id }]),
        }),
    ])
);

// @ts-ignore
const resultPages = new Map(_loaderArr);

/**
 * @param {string} url
 */
export async function handleTaskPost(url) {
  const res = await (
    await fetch("task_post", {
      method: "POST",
      body: JSON.stringify([
        {
          target: url,
          max_crawl_pages: 10,
          enable_browser_rendering: true,
          load_resources: true,
          enable_javascript: true,
        },
      ]),
      headers: [["Content-Type", "application/json"]],
    })
  ).json();

  const task = res.tasks?.at(0);
  if (task?.status_code >= 40000) {
    throw new Error(task?.status_message ?? "Error");
  }

  const id = task.id;

  localStorage.setItem("taskId", id);

  const template = `${ResultHeading("Crawling Initiated")}
  <p>After the website is fetched for crawling, you can start retrieving results using the following endpoints:</p>
  <ul class="result-pages"></ul>
  <p>You can fetch data on pages gradually as our crawler processes the pages; this way you don't have to wait until all the submitted pages are crawled. Alternatively, you can request complete results when the crawling is finished. The crawling process indicator is the crawl_progress field in the results of the Summary endpoint.</p>
  `;

  const section = document.querySelector(".result-container");
  section.innerHTML = template;

  const list = section.querySelector("ul");
  list.append(
    ...Object.values(resultPageNames).map((val) => {
      const li = document.createElement("li");
      li.appendChild(PageDetails(val));
      return li;
    })
  );
}

/**
 * PageDetails Component
 * @param {string} summary The title of the disclosure
 * @returns HTMLDetailsElement
 */
function PageDetails(summary) {
  const details = document.createElement("details");
  details.innerHTML = `<summary>${summary}</summary><div></div>`;
  details.addEventListener(
    "toggle",
    handlePageToggle(resultPages.get(summary))
  );
  return details;
}

/**
 * @param {Function} loaderFn The loader to get the data for a page
 * @returns Toggle Event listener
 */
function handlePageToggle(loaderFn) {
  return async (e) => {
    const details = e.target;

    if (details.open) {
      const loader = new Loader();
      loader.start();

      details.lastElementChild.innerHTML = `<ul>
        ${
          (await loaderFn(localStorage.getItem("taskId"))
            .then((r) => r.json())
            .then((data) =>
              data?.tasks
                ?.at(0)
                ?.result?.map((res, i) => renderValues(`Task ${i + 1}`, res))
            )
            .catch((e) => (console.log(e), e.message ?? "Error"))) ?? "Error"
        }
        </ul>`;

      loader.stop();
    } else {
      details.lastElementChild.innerHTML = "";
    }
  };
}

/**
 * Renders data object to HTML
 * @param {string | undefined} key
 * @param {any} value
 * @returns Approriate HTML string
 */
function renderValues(key, value) {
  if (value === null) return "";

  if (typeof key === "undefined" && typeof value !== "object") {
    return `<li>${snake_case_toSentence(value)}</li>`;
  }

  if (typeof value !== "object" && typeof key === "string") {
    return `<li>
      <p><strong>${snake_case_toSentence(
        key
      )}</strong>:&nbsp; ${snake_case_toSentence(value)}</p>
    </li>`;
  }

  if (Array.isArray(value) && typeof key === "string") {
    return ResultDisclosure(
      key,
      `<ul>${value
        .map((v, i) =>
          renderValues(typeof v !== "object" ? undefined : `Entry ${i + 1}`, v)
        )
        .join("")}
        </ul>`
    );
  }

  if (typeof key === "string")
    return `<li>
      ${ResultDisclosure(
        key,
        `<ul>${Object.entries(value)
          .map(([k, v]) => renderValues(k, v))
          .join("")}
          </ul>`
      )}
    </li>`;

  console.log("Hmm.. unexpected case");
  return "";
}

/**
 * ResultDisclosure Component
 * @param {string} summary The title that goes in the `summary` element, Converts snake case to sentence case.
 * @param {string} children The children elements, wrapped in a div internally.
 * @returns HTML string for ResultDisclosure component
 */
function ResultDisclosure(summary, children) {
  return `<details class="result-disclosure">
    <summary>${snake_case_toSentence(summary)}</summary>
    <div>${children}</div>
  </details>`;
}

/**
 *
 * @param {string} title - The title of the endpoint
 * @returns
 */
function getEndpoint(title) {
  return title.toLowerCase().replace(/[ -]/g, "_");
}

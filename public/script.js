class Loader {
  constructor() {
    this._dialog = document.getElementById("loader");
    this._dialog.addEventListener(
      "keydown",
      (e) => e.key === "Escape" && (e.preventDefault(), e.stopPropagation())
    );
  }

  /** Stop loader */
  stop() {
    this._dialog.open && this._dialog.close();
  }

  /** Start loader */
  start() {
    !this._dialog.open && this._dialog.showModal();
  }
}

const loader = new Loader();

const root = document.getElementById("root");
const section = root.querySelector(".result-container");
const form = document.querySelector("form.form");

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
    (ids) => fetch(`/${getEndpoint(resultPageNames.summary)}/${ids}`),
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

const resultPages = new Map(_loaderArr);

/**
 *
 * @param {string} title - The title of the endpoint
 * @returns
 */
function getEndpoint(title) {
  return title.toLowerCase().replace(/[ -]/g, "_");
}

form instanceof HTMLFormElement &&
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const url = formData.get("url");
    const live = formData.get("live");

    loader.start();

    try {
      if (live) {
        await handleLightHouse(url);
      } else {
        await handleTaskPost(url);
      }
    } catch (e) {
      console.log(e);
      window.alert(e?.message ?? "Error");
    }

    loader.stop();
  });

async function handleLightHouse(url) {
  // call page screenshot api

  const res = await (
    await fetch("lighthouse/live/json", {
      method: "POST",
      body: JSON.stringify([{ url }]),
      headers: [["Content-Type", "application/json"]],
    })
  ).json();

  const data = res.tasks?.at(0)?.result?.at(0);

  if (!data) {
    throw new Error("No data");
  }

  const template = `${resultHeading("Lighthouse Results")}
  <div class="categories">${data.categories
    .map(({ title, score }) => category(title, Math.floor(score * 100)))
    .join("")}</div>
  <div class="audits">${data.audits.map(auditCard).join("")}</div>`;

  section.innerHTML = template;
}

/**
 * Progress Component
 * @param {number} value The precentage value between 0-100
 * @returns HTML string for progress component
 */
function progress(value) {
  return `<div class="progress">
    <div class="barOverflow">
      <div class="bar" style="--value: ${
        (value ?? 0) * 1.8
      }deg; --color: ${getColorFromScore(value)}"></div>
    </div>
    <span>${typeof value !== "number" ? "?" : value + "%"}</span>
  </div>`;
}

/**
 * Category Component
 * @param {string} title
 * @param {number} value
 * @returns HTML string for Category component
 */
function category(title, value) {
  return `<div class="category">
  ${progress(value)}
  <p>${title}</p>
  </div>`;
}

/**
 * AuditCard Component
 * @param { {title: string, description: string,score: number, scoreDisplayMode: 'binary' | 'numeric', displayValue: string}} data - Audit Card data
 * @returns HTML string for AuditCard component
 */
function auditCard({
  title,
  description,
  score,
  scoreDisplayMode,
  displayValue,
}) {
  const desc =
    description.at(description.length - 1) === "."
      ? description.slice(0, description.length - 1)
      : description;

  return `<article class="audit-card">
   ${
     scoreDisplayMode === "numeric"
       ? `<span class="score" style="--color: ${getColorFromScore(
           Math.floor(score * 100)
         )}">${Math.floor(score * 100)}%</span>`
       : scoreDisplayMode === "binary"
       ? `<span class="score">${score === 0 ? "❌" : "✅"}</span>`
       : ""
   }
  <h6>${title}</h6>
  ${displayValue ? `<p>${displayValue}</p>` : ""}
  <p class="description">${desc}</p>
  </article>`;
}

/**
 * Escapes HTML entities in a string
 * @param {string} str - The string to escape
 * @returns Escaped string
 */
function escapeHTML(str) {
  const escape = document.createElement("textarea");
  escape.textContent = str;
  return escape.innerHTML;
}

/**
 * @param {number} score - Score value between 0-100
 * @returns Hex Color value depending on the score
 */
function getColorFromScore(score) {
  return score < 50 ? "#F44133" : score < 89 ? "#FFAA33" : "#7DB440";
}

async function handleTaskPost(url) {
  const res = await (
    await fetch("task_post", {
      method: "POST",
      body: JSON.stringify([
        {
          target: url,
          max_crawl_pages: 1,
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

  const template = `${resultHeading("Crawling Initiated")}
  <p>After the website is fetched for crawling, you can start retrieving results using the following endpoints:</p>
  <ul class="result-pages"></ul>
  <p>You can fetch data on pages gradually as our crawler processes the pages; this way you don't have to wait until all the submitted pages are crawled. Alternatively, you can request complete results when the crawling is finished. The crawling process indicator is the crawl_progress field in the results of the Summary endpoint.</p>
  `;

  section.innerHTML = template;

  const list = section.querySelector("ul");
  list.append(
    ...Object.values(resultPageNames).map((val) => {
      const li = document.createElement("li");
      li.appendChild(pageDetails(val));
      return li;
    })
  );
}

/**
 * PageDetails Component
 * @param {string} summary The title of the disclosure
 * @returns HTMLDetailsElement
 */
function pageDetails(summary) {
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
 * ResultHeading Component
 * @param {string} title
 * @returns HTML string for resultHeading Component
 */
function resultHeading(title) {
  return `<h2 class="result-heading">${title}</h2>`;
}
/**
 * Renders data object to HTML
 * @param {string | undefined} key
 * @param {any} val
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
    console.log(key, typeof value);
    return resultDisclosure(
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
      ${resultDisclosure(
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
function resultDisclosure(summary, children) {
  return `<details class="result-disclosure">
    <summary>${snake_case_toSentence(summary)}</summary>
    <div>${children}</div>
  </details>`;
}
/**
 * Replaces underscores with space, and makes the first letter capital
 * @param {string | number | boolean} convertibleToString - String convertible value
 */
function snake_case_toSentence(convertibleToString) {
  const str = "" + convertibleToString;
  return str.at(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

// show loader ✅
// Present lighthouse data ✅
// Add favicon
// Make classic page 1 ✅
// make summary page --
//    Key-Value pairs as dt, dd for primitive value
//    Else, details element
//    unordered list for array
// add page screenshot api --
// make iframe
// enable cors
// make react app
// make SPA PWA
// enable push notifications

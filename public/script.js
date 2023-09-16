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
      }
    } catch (e) {
      window.alert("Error: " + JSON.stringify(e ?? {}));
    }

    loader.stop();
    return;
    const res = await (
      await (live
        ? fetch("lighthouse/live/json", {
            method: "POST",
            body: JSON.stringify([{ url }]),
            headers: [["Content-Type", "application/json"]],
          })
        : await fetch("task_post", {
            method: "POST",
            body: JSON.stringify([{ target: url, max_crawl_pages: 0 }]),
            headers: [["Content-Type", "application/json"]],
          }))
    ).json();

    console.log(res);
  });

// show loader ✅
// add page screenshot api ❌
// Present lighthouse data ✅
// Make classic page 1 --
// make summary page --
// make iframe
// enable cors
// make react app
// make SPA PWA
// enable push notifications

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

  const template = `<h2 class="result-heading">Lighthouse Results</h2>
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

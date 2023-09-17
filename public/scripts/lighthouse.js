import { ResultHeading, getColorFromScore } from "./utils.js";

/**
 *
 * @param {string} url - User Input URL
 */
export async function handleLightHouse(url) {
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

  const template = `${ResultHeading("Lighthouse Results")}
  <div class="categories">${data.categories
    .map(({ title, score }) => Category(title, Math.floor(score * 100)))
    .join("")}</div>
  <div class="audits">${data.audits.map(AuditCard).join("")}</div>`;

  const section = document.querySelector(".result-container");
  section && (section.innerHTML = template);
}

/**
 * Category Component
 * @param {string} title
 * @param {number} value
 * @returns HTML string for Category component
 */
function Category(title, value) {
  return `<div class="category">
  ${Progress(value)}
  <p>${title}</p>
  </div>`;
}
/**
 * Progress Component
 * @param {number} value The precentage value between 0-100
 * @returns HTML string for progress component
 */
function Progress(value) {
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
 * AuditCard Component
 * @param { {title: string, description: string,score: number, scoreDisplayMode: 'binary' | 'numeric', displayValue: string}} data - Audit Card data
 * @returns HTML string for AuditCard component
 */
function AuditCard({
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

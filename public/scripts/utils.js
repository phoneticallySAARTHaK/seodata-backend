/**
 * @param {number} score - Score value between 0-100
 * @returns Hex Color value depending on the score
 */
export function getColorFromScore(score) {
  return score < 50 ? "#F44133" : score < 89 ? "#FFAA33" : "#7DB440";
}

/**
 * ResultHeading Component
 * @param {string} title
 * @returns HTML string for resultHeading Component
 */
export function ResultHeading(title) {
  return `<h2 class="result-heading">${title}</h2>`;
}

/**
 * Replaces underscores with space, and makes the first letter capital
 * @param {string | number | boolean} convertibleToString - String convertible value
 */
export function snake_case_toSentence(convertibleToString) {
  const str = "" + convertibleToString;
  return str.at(0)?.toUpperCase() + str.slice(1).replace(/_/g, " ");
}

export class Loader {
  constructor() {
    this._dialog = document.getElementById("loader");
    if (this._dialog)
      this._dialog.addEventListener(
        "keydown",
        (e) => e.key === "Escape" && (e.preventDefault(), e.stopPropagation())
      );
  }

  /** Stop loader */
  stop() {
    this._dialog instanceof HTMLDialogElement &&
      this._dialog.open &&
      this._dialog.close();
  }

  /** Start loader */
  start() {
    this._dialog instanceof HTMLDialogElement &&
      !this._dialog.open &&
      this._dialog.showModal();
  }
}

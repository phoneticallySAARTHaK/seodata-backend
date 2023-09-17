import { handleTaskPost } from "./classic.js";
import { handleLightHouse } from "./lighthouse.js";
import { Loader } from "./utils.js";

const root = document.getElementById("root");

(function replace() {
  const template = document.getElementById("template");
  template instanceof HTMLTemplateElement &&
    root?.replaceChildren(template.content.cloneNode(true));
  template?.remove();
})();

const loader = new Loader();
const form = document.querySelector("form.form");

form instanceof HTMLFormElement &&
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const url = formData.get("url");
    const live = formData.get("live");

    if (typeof url !== "string" || !url) {
      return;
    }

    loader.start();

    try {
      if (live) {
        await handleLightHouse(url);
      } else {
        await handleTaskPost(url);
      }
    } catch (e) {
      console.log(e);
      window.alert(e instanceof Error ? e.message : "Error");
    }

    loader.stop();
  });

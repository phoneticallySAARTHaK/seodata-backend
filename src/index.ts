import express from "express";
import { apiPaths, endpoints } from "./dataForSeo/endpoints";
import { env } from "./env";
import { Utils, formatLighthouseLiveResponse } from "./utils";

const app = express();

app.use(express.json());

env.DEV && app.use("/docs", express.static("docs"));

env.MODE === "old-school" && app.use("/", express.static("public"));

Object.keys(apiPaths).forEach((_key) => {
  const key = _key as keyof typeof apiPaths;

  if (key === "summary") {
    return void app.get(`/${apiPaths[key]}/:id`, async (req, res) => {
      res.json(await Utils.fetch(`${endpoints[key]}/${req.params.id}`));
    });
  }

  app.post(`/${apiPaths[key]}`, async (req, res) => {
    const body = req.body;

    const apiRes = await Utils.fetch(endpoints[key], {
      method: "POST",
      body,
    });

    res.json(
      key === "lighthouse_live" ? formatLighthouseLiveResponse(apiRes) : apiRes
    );
  });
});

app.listen(env.PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${env.PORT}`);
});

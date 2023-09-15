import express from "express";
import { apiPaths, endpoints } from "./dataForSeo/endpoints";
import { PORT } from "./env";
import { Utils, formatLighthouseLiveResponse } from "./utils";

const app = express();

app.use(express.json());

Object.keys(apiPaths).forEach((_key) => {
  const key = _key as keyof typeof apiPaths;

  app.post(`/${apiPaths[key]}`, async (req, res) => {
    const body = req.body;

    if (apiPaths[key] === apiPaths.summary) {
      const id = body.id;
      res.send(await Utils.fetch(`${endpoints[key]}/${id}`));
    } else {
      const apiRes = await Utils.fetch(endpoints[key], {
        method: "POST",
        body,
      });

      res.send(
        apiPaths[key] === apiPaths.lighthouse_live
          ? formatLighthouseLiveResponse(apiRes)
          : apiRes
      );
    }
  });
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});

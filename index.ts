import express from "express";
import dotenv from "dotenv";
import { getBasicAuth } from "./utils";
import { TaskPostRequestTask, TaskPostResponse } from "./types";
import { endpoints } from "./endpoints";

dotenv.config();

const app = express();
const port = process.env.PORT;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

console.assert(username && password);

if (!(username && password)) {
  throw new Error("Username or password missing");
}

app.use(express.json());

app.post("/:url*", async (req, res) => {
  const params = req.params as unknown as { url: string; "0": string };

  const url = params.url + params["0"];

  const task: TaskPostRequestTask = {
    target: url,
    max_crawl_pages: 0,
    // force_sitewide_checks: true,
    // enable_browser_rendering: true,
  };

  const seoApiRes = (await (
    await fetch(endpoints.task_post, {
      method: "POST",
      headers: [
        ["Authorization", getBasicAuth(username, password)],
        ["Content-Type", "application/json"],
      ],
      body: JSON.stringify([task]),
    })
  ).json()) as TaskPostResponse;

  console.log(JSON.stringify(seoApiRes, null, 2));

  res.send(seoApiRes);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

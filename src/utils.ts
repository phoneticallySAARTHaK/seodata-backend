import {
  LighthouseLiveResponse,
  LighthouseResult,
} from "./dataForSeo/models/lighthouse";
import { PASSWORD, USERNAME } from "./env";

/** Convert string to base64 */
export function base64(str: string) {
  return Buffer.from(str).toString("base64");
}

/**Get the Basic Auth string */
export function getBasicAuth<
  TUsername extends string,
  TPassword extends string
>(username: TUsername, password: TPassword) {
  return `Basic ${base64(`${username}:${password}`)}` as const;
}

export type JsonObject = { [key: string]: JsonValue };

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonObject
  | JsonValue[];

type NonBodyMethods = "GET" | "HEAD";
type BodyMethods = "POST" | "PUT" | "PATCH" | "DELETE";

/** Returns a wrapper over fetch which adds authorization and content type headers */
export const getAuthenticatedFetch = (username: string, password: string) => {
  return async (
    resource: RequestInfo | URL,
    init?: Omit<RequestInit, "body" | "method"> &
      (
        | {
            body?: JsonValue;
            method: BodyMethods;
          }
        | {
            body?: never;
            method?: NonBodyMethods;
          }
      )
  ) => {
    const headers = new Headers(
      resource instanceof Request
        ? resource.headers || init?.headers
        : init?.headers
    );

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (!headers.has("Authorization")) {
      headers.set("Authorization", getBasicAuth(username, password));
    }

    let errorFlag = false;

    const res = await (
      await fetch(resource, {
        ...init,
        headers,
        body: JSON.stringify(init?.body),
      })
    )
      .json()
      .catch((error) => {
        console.log(error);

        return {
          message: JSON.stringify(error ?? "Unexpected error"),
        };
      });

    return res;
  };
};

export namespace Utils {
  /** Validates url */
  export function isValidUrl(urlString: string) {
    try {
      new URL(urlString);
      return true;
    } catch (error) {
      return false;
    }
  }

  export const descriptiveStatusMessages = {
    TaskCreated: `Crawling initiated. You can start retrieving results using the following endpoints: summary, pages, pages_by_resource, resources, duplicate_tags, duplicate_content, links, redirect_chains, non_indexable, waterfall, keyword_density, raw_html`,
  } as const;

  export const fetch = getAuthenticatedFetch(USERNAME, PASSWORD);
}

export function formatLighthouseLiveResponse(
  res: LighthouseLiveResponse | undefined
) {
  return {
    ...res,
    tasks:
      res?.tasks?.map?.((task) => {
        return {
          ...task,
          result: task.result?.map?.(formatLighthouseResult),
        };
      }) ?? [],
  };
}

function formatLighthouseResult({ categories, audits }: LighthouseResult) {
  return {
    categories: Object.entries(categories ?? {}).map(
      ([_key, { score, title }]) => ({ title, score })
    ),
    audits: Object.entries(audits ?? {})
      .filter(([_key, val]) => typeof val.score === "number")
      .map(([_key, { displayMode, title, score, description }]) => ({
        displayMode,
        title,
        score,
        description,
      })),
  };
}

import dotenv from "dotenv";

dotenv.config();

export namespace env {
  // @ts-ignore
  const p = process.env;
  export const PORT = p.PORT;
  export const USERNAME = p.USERNAME as string;
  export const PASSWORD = p.PASSWORD as string;
  export const DEV = p.NODE_ENV !== "production";
  export const MODE = p.MODE as "backend" | "old-school";

  if (!(USERNAME && PASSWORD && PORT)) {
    throw new Error(
      "Env variable(s) missing" +
        JSON.stringify({ USERNAME, PASSWORD, PORT }, null, 2),
    );
  }
}

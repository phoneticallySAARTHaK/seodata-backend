import dotenv from "dotenv";

dotenv.config();

export namespace env {
  export const PORT = process.env.PORT;
  export const USERNAME = process.env.USERNAME as string;
  export const PASSWORD = process.env.PASSWORD as string;
  export const DEV = process.env.NODE_ENV !== "production";
  export const MODE = process.env.MODE as "backend" | "old-school";

  if (!(USERNAME && PASSWORD && PORT)) {
    throw new Error("Env variable(s) missing");
  }
}

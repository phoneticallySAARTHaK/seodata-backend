import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const USERNAME = process.env.USERNAME as string;
export const PASSWORD = process.env.PASSWORD as string;

if (!(USERNAME && PASSWORD && PORT)) {
  throw new Error("Env variable(s) missing");
}

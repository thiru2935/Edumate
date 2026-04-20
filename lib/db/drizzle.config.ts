import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
  override: true,
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

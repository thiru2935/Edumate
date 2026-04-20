import dotenv from "dotenv";
import path from "path";
import app from "./app";
import { logger } from "./lib/logger";

dotenv.config({
  path: path.resolve(process.cwd(), "../../.env"),
  override: true,
});

const rawPort = process.env.API_PORT ?? process.env.PORT ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(
    `Invalid API port value: "${rawPort}". Set API_PORT or PORT to a positive number.`,
  );
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

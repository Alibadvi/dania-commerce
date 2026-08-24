import { bootstrap, bootstrapWorker, Logger } from "@vendure/core";
import { config } from "./vendure-config.js";

async function start() {
  await bootstrap(config);

  if (process.env.RUN_WORKER_IN_PROCESS === "true") {
    const worker = await bootstrapWorker(config);
    await worker.startJobQueue();
    Logger.info("Danya demo worker is running with the API", "Bootstrap");
  }

  Logger.info("Danya Vendure server is ready", "Bootstrap");
}

start().catch((error: unknown) => {
  Logger.error(error instanceof Error ? error.message : String(error), "Bootstrap");
  process.exitCode = 1;
});

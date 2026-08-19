import { bootstrapWorker, Logger } from "@vendure/core";
import { config } from "./vendure-config.js";

bootstrapWorker(config)
  .then((worker) => worker.startJobQueue())
  .then(() => Logger.info("Danya Vendure worker is ready", "Worker"))
  .catch((error: unknown) => {
    Logger.error(error instanceof Error ? error.message : String(error), "Worker");
    process.exitCode = 1;
  });

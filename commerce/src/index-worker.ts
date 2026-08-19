import "reflect-metadata";
import { bootstrapWorker, Logger } from "@vendure/core";
import { config } from "./vendure-config";

bootstrapWorker(config)
  .then((worker) => worker.startJobQueue())
  .then(() => Logger.info("Dania commerce worker is ready", "Worker"))
  .catch((error) => {
    Logger.error(error instanceof Error ? error.message : String(error), "Worker");
    process.exit(1);
  });

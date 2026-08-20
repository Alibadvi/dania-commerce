import { bootstrapWorker, Logger } from "@vendure/core";
import { config } from "./vendure-config.js";

bootstrapWorker(config)
  .then(async (worker) => {
    await worker.startJobQueue();
    if (process.env.WORKER_HEALTH_PORT) {
      await worker.startHealthCheckServer({ port: Number(process.env.WORKER_HEALTH_PORT), hostname: "0.0.0.0", route: "/health" });
    }
    return worker;
  })
  .then(() => Logger.info("Danya Vendure worker is ready", "Worker"))
  .catch((error: unknown) => {
    Logger.error(error instanceof Error ? error.message : String(error), "Worker");
    process.exitCode = 1;
  });

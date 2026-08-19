import { bootstrap, Logger } from "@vendure/core";
import { config } from "./vendure-config.js";

bootstrap(config)
  .then(() => Logger.info("Danya Vendure server is ready", "Bootstrap"))
  .catch((error: unknown) => {
    Logger.error(error instanceof Error ? error.message : String(error), "Bootstrap");
    process.exitCode = 1;
  });

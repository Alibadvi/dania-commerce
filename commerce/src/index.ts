import "reflect-metadata";
import { bootstrap, Logger } from "@vendure/core";
import { config } from "./vendure-config";

bootstrap(config)
  .then(() => Logger.info("Dania commerce server is ready", "Bootstrap"))
  .catch((error) => {
    Logger.error(error instanceof Error ? error.message : String(error), "Bootstrap");
    process.exit(1);
  });

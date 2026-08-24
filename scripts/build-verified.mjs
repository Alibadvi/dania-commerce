import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vinextCli = path.join(
  projectRoot,
  "node_modules",
  "vinext",
  "dist",
  "cli.js",
);

function durationToMilliseconds(value) {
  const match = /^(\d+)(ms|s|m)?$/i.exec(value.trim());
  if (!match) throw new Error(`Invalid SITES_BUILD_TIMEOUT value: ${value}`);

  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? "ms";
  const multiplier = unit === "m" ? 60_000 : unit === "s" ? 1_000 : 1;
  return amount * multiplier;
}

const timeout = durationToMilliseconds(process.env.SITES_BUILD_TIMEOUT ?? "8m");
console.log("Running bounded vinext build...");

const build = spawnSync(process.execPath, [vinextCli, "build"], {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
  timeout,
});

if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

await import("./validate-artifact.mjs");

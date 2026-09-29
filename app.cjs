"use strict";

const path = require("node:path");
const { pathToFileURL } = require("node:url");

const cliPath = path.join(__dirname, "node_modules", "vinext", "dist", "cli.js");

process.chdir(__dirname);
process.argv = [process.execPath, cliPath, "start", "--hostname", "0.0.0.0"];

import(pathToFileURL(cliPath).href).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

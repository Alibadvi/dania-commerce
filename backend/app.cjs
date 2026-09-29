"use strict";

const path = require("node:path");
const { pathToFileURL } = require("node:url");

process.chdir(__dirname);
import(pathToFileURL(path.join(__dirname, "dist", "index.js")).href).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

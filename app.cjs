"use strict";

const path = require("node:path");
const { pathToFileURL } = require("node:url");

const serverPath = path.join(__dirname, "bundle", "server.js");

process.chdir(__dirname);

import(pathToFileURL(serverPath).href).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

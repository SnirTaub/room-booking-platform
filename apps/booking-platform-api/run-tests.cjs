"use strict";

require("dotenv").config();
require("./tests/mocks/logger.cjs");

const Mocha = require("mocha");
const path = require("path");
const glob = require("glob");

const mocha = new Mocha({ timeout: 5000 });

const files = glob.sync("dist/tests/**/*.test.js");
files.forEach((f) => mocha.addFile(path.resolve(f)));

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
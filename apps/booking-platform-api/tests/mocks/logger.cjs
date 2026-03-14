"use strict";

const path = require("path");
const logger = require(path.join(__dirname, "../../dist/src/common/utils/logger")).logger;

logger.info = function () {};
logger.error = function () {};
logger.debug = function () {};
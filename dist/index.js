"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("./services");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const port = utils_1.parseNumber(process.env.DISCOVERY_PORT, constants_1.Constants.discoveryPort);
const expiryTTL = utils_1.parseNumber(process.env.EXPIRY_TTL, constants_1.Constants.applicationTTLinMilliseconds);
const interval = utils_1.parseNumber(process.env.SWEEP_INTERVAL, constants_1.Constants.sweepingIntervalTimeInMilliseconds);
services_1.app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
services_1.startSweeping(expiryTTL, interval);

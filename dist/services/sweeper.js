"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSweeping = void 0;
const dao_1 = require("../dao");
const startSweeping = (expiryTTL, interval) => {
    console.log(`Expiry time is ${expiryTTL / 1000} seconds.`);
    console.log(`Expired applications will be removed every ${interval / 1000} seconds.`);
    sweep(expiryTTL);
    setInterval(() => {
        sweep(expiryTTL);
    }, interval);
};
exports.startSweeping = startSweeping;
const sweep = (expiryTTL) => {
    console.log('Searching expired applications...');
    const applications = dao_1.ApplicationDAO.getApplicationsCollection();
    applications.removeWhere((application) => {
        if (application.updatedAt <= Date.now() - expiryTTL) {
            console.log(`Removing expired application -> group: '${application.group}' - id: '${application.id}'`);
            return true;
        }
        return false;
    });
};

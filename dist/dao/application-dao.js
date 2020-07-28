"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = exports.getApplicationsCollection = void 0;
const lokijs_1 = __importDefault(require("lokijs"));
const constants_1 = require("../constants");
const fsAdapter = new lokijs_1.default.LokiFsAdapter();
let applications;
const db = new lokijs_1.default(constants_1.Constants.dbName, {
    autosave: true,
    autoload: true,
    adapter: fsAdapter,
    autoloadCallback: initApplicationsCollection,
});
function initApplicationsCollection() {
    applications = db.getCollection(constants_1.Constants.collectionName);
    if (!applications) {
        applications = db.addCollection(constants_1.Constants.collectionName, {
            clone: true
        });
    }
}
function getApplicationsCollection() {
    if (!applications) {
        initApplicationsCollection();
    }
    return applications;
}
exports.getApplicationsCollection = getApplicationsCollection;
function getDB() {
    return db;
}
exports.getDB = getDB;

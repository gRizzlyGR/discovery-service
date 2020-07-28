"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const ajv_1 = __importDefault(require("ajv"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dao_1 = require("../dao");
const schemas_1 = require("../schemas");
const app = express_1.default();
exports.app = app;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(morgan_1.default('tiny'));
app.get('/', (_, res) => {
    const applications = dao_1.ApplicationDAO.getApplicationsCollection();
    const docs = applications.find({});
    const groupToApplications = new Map();
    docs.forEach(doc => {
        var _a;
        const groupedApplications = (_a = groupToApplications.get(doc.group)) !== null && _a !== void 0 ? _a : [];
        groupedApplications.push(doc);
        groupToApplications.set(doc.group, groupedApplications);
    });
    const groupSummaries = [];
    for (const [group, applications] of groupToApplications) {
        groupSummaries.push({
            group,
            instances: applications.length,
            createdAt: Math.min(...applications.map(application => application.createdAt)),
            lastUpdatedAt: Math.max(...applications.map(application => application.updatedAt))
        });
    }
    res.send(groupSummaries);
});
app.post('/:group/:id', async (req, res) => {
    const applications = dao_1.ApplicationDAO.getApplicationsCollection();
    const body = req.body;
    const ajv = new ajv_1.default();
    const valid = ajv.validate(schemas_1.RequestBodySchema, body);
    if (!valid) {
        res.status(400).json({ error: ajv.errorsText(ajv.errors) });
        return;
    }
    const target = {
        id: req.params.id,
        group: req.params.group
    };
    const found = applications.findOne(target);
    let status;
    if (found) {
        found.updatedAt = Date.now();
        if (body.metadata) {
            found.metadata = body.metadata;
        }
        target.createdAt = found.createdAt;
        target.updatedAt = found.updatedAt;
        target.metadata = found.metadata;
        applications.update(found);
        status = 200;
    }
    else {
        const now = Date.now();
        target.createdAt = now;
        target.updatedAt = now;
        target.metadata = body.metadata;
        applications.insert(target);
        status = 201;
    }
    res.status(status).json(target);
});
app.delete('/:group/:id', (req, res) => {
    const applications = dao_1.ApplicationDAO.getApplicationsCollection();
    const id = req.params.id;
    const group = req.params.group;
    const found = applications.findOne({
        id,
        group
    });
    if (found) {
        applications.remove(found);
        res.status(200).json({ message: `Application ${JSON.stringify({ id, group })} successfully deleted` });
    }
    else {
        res.status(404).json({ message: 'Not Found' });
    }
});
app.get('/:group', (req, res) => {
    const applications = dao_1.ApplicationDAO.getApplicationsCollection();
    const found = applications.find({
        group: req.params.group
    });
    const applicationsByGroup = found
        .map(doc => {
        return {
            id: doc.id,
            group: doc.group,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            metadata: doc.metadata
        };
    });
    res.json(applicationsByGroup);
});

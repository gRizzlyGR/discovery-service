import Ajv from 'ajv';
import express from 'express';
import morgan from 'morgan';
import { ApplicationDAO } from '../dao';
import { Application, ApplicationRequestBody, GroupSummary } from '../models';
import { RequestBodySchema } from '../schemas';

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'))

app.get('/', (_, res) => {
    
    const applications = ApplicationDAO.getApplicationsCollection();

    // Find all docs
    const docs = applications.find({})

    // Map each group to its bundle of applications
    const groupToApplications = new Map<string, Application[]>()

    docs.forEach(doc => {
        const groupedApplications = groupToApplications.get(doc.group) ?? [];
        groupedApplications.push(doc);
        groupToApplications.set(doc.group, groupedApplications);
    })

    // Create summaries for each group:
    // - How many applications belong to it
    // - Creation timestamp of the first registered application
    // - Most recent update timestamp of one of the application 
    const groupSummaries: GroupSummary[] = [];
    for (const [group, applications] of groupToApplications) {
        groupSummaries.push({
            group,
            instances: applications.length,
            createdAt: Math.min(...applications.map(application => application.createdAt)),
            lastUpdatedAt: Math.max(...applications.map(application => application.updatedAt))
        })
    }

    res.send(groupSummaries);
})

app.post('/:group/:id', async (req, res) => {
    const applications = ApplicationDAO.getApplicationsCollection();

    const body: ApplicationRequestBody = req.body;

    const ajv = new Ajv();
    const valid = ajv.validate(RequestBodySchema, body);

    if (!valid) {
        res.status(400).json({ error: ajv.errorsText(ajv.errors) })
        return;
    }

    // Create partial object to be used to query db and to be filled later upon returning
    const target: Partial<Application> = {
        id: req.params.id,
        group: req.params.group
    }

    // Find by id and group
    const found = applications.findOne(target)

    // If found, updates the found object properties to reflect the changes
    if (found) {
        // Update loki object fields
        found.updatedAt = Date.now();

        // If there are new metadata, replace the old ones
        if (body.metadata) {
            found.metadata = body.metadata;
        }

        // Set fields for object to return
        target.createdAt = found.createdAt;
        target.updatedAt = found.updatedAt;
        target.metadata = found.metadata;

        applications.update(found);
    } else {
        const now = Date.now();

        target.createdAt = now;
        target.updatedAt = now;
        target.metadata = body.metadata;

        // Safe to cast since now all fields are set
        applications.insert(target as Application)
    }

    res.json(target);
})

app.delete('/:group/:id', (req, res) => {
    const applications = ApplicationDAO.getApplicationsCollection();

    // Find by id and group
    const found = applications.findOne({
        id: req.params['id'],
        group: req.params['group']
    })

    if (found) {
        applications.remove(found)
        res.status(200).json();
    } else {
        res.status(404).json({ message: 'Not Found' });
    }
})

app.get('/:group', (req, res) => {
    const applications = ApplicationDAO.getApplicationsCollection();

    const found = applications.find({
        group: req.params.group
    })

    const applicationsByGroup: Application[] = found
        .map(doc => {
            return {
                id: doc.id,
                group: doc.group,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                metadata: doc.metadata
            }
        })

    res.json(applicationsByGroup);
})


export { app };

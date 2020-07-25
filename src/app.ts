import loki from '@lokidb/loki';
import express from 'express';
import morgan from 'morgan';
import { Application, ApplicationRequestBody, GroupSummary } from './models';

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'))

const db = new loki('applicationDB')

const applications = db.addCollection<Application>('applications', {
    clone: true // Cloning preserve original object, and don't pollute the client response with useless properties
});

app.get('/', (_, res) => {
    // Find all docs
    const docs = applications.find({})

    const groupToApplications = new Map<string, Application[]>()

    docs.forEach(doc => {
        const groupedApplications = groupToApplications.get(doc.group) ?? [];
        groupedApplications.push(doc);
        groupToApplications.set(doc.group, groupedApplications);
    })

    const groupSummaries: GroupSummary[] = [];
    for (const [group, applications] of groupToApplications) {
        groupSummaries.push({
            group: group,
            instances: applications.length,
            createdAt: Math.min(...applications.map(application => application.createdAt)),
            lastUpdatedAt: Math.max(...applications.map(application => application.updatedAt))
        })
    }

    res.send(groupSummaries);
})

app.post('/:group/:id', async (req, res) => {
    const body: ApplicationRequestBody = req.body;

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

    res.send(target);
})

app.delete('/:group/:id', (req, res) => {
    // Find by id and group
    const found = applications.findOne({
        id: req.params['id'],
        group: req.params['group']
    })

    if (found) {
        applications.remove(found)
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
})


app.get('/:group', (req, res) => {
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

    res.send(applicationsByGroup);
})


export { app };

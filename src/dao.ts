import { FSStorage } from '@lokidb/fs-storage';
import loki, { Collection } from '@lokidb/loki';
import { Application } from './models';

const db = new loki('application.db.json');
const fsAdapter = new FSStorage();

export function getApplicationsCollection(): Collection<Application> {
    db.initializePersistence({
        autosave: true,
        adapter: fsAdapter
    })

    let applications = db.getCollection<Application>('applications');

    if (!applications) {
        console.log('Collection not found, it will be created');
        applications = db.addCollection<Application>('applications', {
            clone: true // Cloning preserve original object, and don't pollute the client response with useless properties
        });
    }

    return applications;
}

export default {
    getApplicationsCollection
}
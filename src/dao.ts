import loki from 'lokijs';
import { Application } from './models';
import { Constants } from './constants';

const fsAdapter = new loki.LokiFsAdapter();

let applications: Collection<Application>;

const db = new loki(Constants.dbName, {
    autosave: true,
    autoload: true,
    adapter: fsAdapter,
    autoloadCallback: initApplicationsCollection,
});

function initApplicationsCollection() {
    applications = db.getCollection<Application>(Constants.collectionName);

    if (!applications) {
        applications = db.addCollection<Application>(Constants.collectionName, {
            clone: true // Cloning preserve original object, and don't pollute the client response with useless properties
        })
    }
}

function getApplicationsCollection(): Collection<Application> {
    return applications;
}

export default {
    getApplicationsCollection
}
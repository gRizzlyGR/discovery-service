import loki from 'lokijs';
import { Application } from './models';
import { Constants } from './constants';

const fsAdapter = new loki.LokiFsAdapter();

let applications: Collection<Application>;

const db = new loki(process.env.DBNAME ?? Constants.dbName, {
    autosave: true,
    autoload: true,
    adapter: fsAdapter,
    autoloadCallback: initApplicationsCollection,
});

/**
 * Callback for init db and collection
 */
function initApplicationsCollection() {
    applications = db.getCollection<Application>(Constants.collectionName);

    if (!applications) {
        applications = db.addCollection<Application>(Constants.collectionName, {
            clone: true // Cloning preserve original object, and don't pollute the client response with useless properties
        })
    }
}

/**
 * Return applications collection object
 */
function getApplicationsCollection(): Collection<Application> {
    // if (!applications) {
    //     initApplicationsCollection();
    // }

    return applications;
}

function getDB(): loki {
    return db;
}

export default {
    getApplicationsCollection,
    getDB
}
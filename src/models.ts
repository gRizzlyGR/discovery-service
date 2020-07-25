import { createRxDatabase, RxCollection, RxDatabase, RxDocument, RxJsonSchema } from 'rxdb';

export type Application = {
    id: string;
    group: string;
    createdAt: number;
    updatedAt: number;
    meta?: object;
}

export type GroupSummary = {
    group: string;
    instances: number;
    createdAt: number;
    updatedAt: number;
}

export type ApplicationDocument = RxDocument<Application, ApplicationDocumentMethods>;

export type ApplicationDocumentMethods = {
    // createAt: () => void;
    // updateAt: () => void;
}

export type ApplicationCollectionMethods = {
    //getByGroup: (group: string) => Promise<Application[]>;
    //getGroupSummaries: () => Promise<GroupSummary[]>;
    //get: (id: string) => Promise<Application>;
    //delete: (id: string) => Promise<void>;
    //put: (application: Application) => Promise<void>
}

export type ApplicationCollection = RxCollection<Application, ApplicationDocumentMethods, ApplicationCollectionMethods>;

export type DbCollections = {
    applications: ApplicationCollection;
}

export type ApplicationDatabase = RxDatabase<DbCollections>

// @ts-ignore
export async function initDb(dbName: string, adapter?: string): Promise<ApplicationDatabase> {
    const db: ApplicationDatabase = await createRxDatabase<DbCollections>({
        name: 'myDb',
        adapter: adapter ?? 'memory'
    })

    return db;
}

export const applicationSchema: RxJsonSchema<Application> = {
    title: 'Application Json Schema',
    version: 0.1,
    type: 'object',
    properties: {
        id: {
            type: 'string',
            primary: true
        },
        group: {
            type: 'string'
        },
        createdAt: {
            type: 'integer'
        },
        updatedAt: {
            type: 'integer'
        },
        meta: {
            type: 'object'
        }
    },
    required: [
        'id',
        'group'
    ]
}

// const applicationDocumentMethods: ApplicationDocumentMethods = {
//     // createAt: function(this: ApplicationDocument) {
//     //     this.createdAt = 
//     // }
// }

// const applicationCollectionMethods: ApplicationCollectionMethods = {
//     // getGroupSummaries: async function(this: ApplicationCollection): Promise<GroupSummary[]> {
//     // }
// }

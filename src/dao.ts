import { createRxDatabase } from "rxdb";

export class Dao {
    static async init(dbName: string) {
        return createRxDatabase({
            name: dbName,
            adapter: 'indexeddb',
        });
    }
}
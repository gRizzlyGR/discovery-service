import express from 'express';
import { initDb, applicationSchema, Application } from './models';
const app = express();

const dbName = 'applicatioDb';

app.put('/:group/:id', async (req, res) => {
    const application: Application = req.body;

    const db = await initDb(dbName);

    await db.collection({
        name: 'applications',
        schema: applicationSchema
    })

    await db.applications.insert(application);

    const pippo = await db.applications.findOne();

    console.log(JSON.stringify(pippo))
    
    res.send('PUT');
})

app.delete('/:group/:id', (_, res) => {
    res.send('DELETE');
})

app.get('/', (_, res) => {
    res.send('GET');
})

app.get('/:group', (_, res) => {
    res.send('GET group');
})

export { app };

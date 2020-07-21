import express from 'express';

const app = express();

app.put('/:group/:id', (_, res) => {
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
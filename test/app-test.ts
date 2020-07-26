import { assert } from 'console';
import { Server } from 'http';
import { describe, it } from 'mocha';
import request from 'supertest';
import { app } from '../src/app';
import dao from '../src/dao';

let server: Server;

before(() => {
    const randomPort = Math.floor(Math.random() * (10000 - 5000) + 5000);
    server = app.listen(randomPort, () => {
        console.log(`Listening on port: ${randomPort}`);
    })
})

// Mocha hangs if every stream is not closed
after(() => {
    server.close();
    dao.getDB().close();
})

describe('app.ts', () => {

    describe('POST /:group/:id', () => {

    })

    describe('DELETE /:group/:id', () => {
        it('should return 200 ok', (done) => {
            request(server)
                .post('/mock-group/mock-id')
                .set('Content-Type', 'application/json')
                .expect(200)

            request(server)
                .delete('/mock-group/mock-id')
                .expect('Content-Type', /json/)
                .expect(200, done)
        })


        it('should return 404 not found', (done) => {
            request(server)
                .delete('/mock-group/mock-id')
                .expect('Content-Type', /json/)
                .expect(404, done)
        })
    })

    describe('GET /', () => {
        it('should return an empty array', (done) => {
            request(server)
                .get('/')
                .expect('Content-Type', /json/)
                .expect((res) => {
                    assert(res.body, [])
                })
                .expect(200, done)
        })
    })

    describe('GET /:group', () => {
        it('should return an empty array', (done) => {
            request(server)
                .get('/mock-group')
                .expect('Content-Type', /json/)
                .expect((res) => {
                    assert(res.body, [])
                })
                .expect(200, done)
        })
    })
})


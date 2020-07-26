import { Constants } from '../../src/constants';
// Override db name so to use a test one. MUST BE SET BEFORE IMPORTING DAO
Constants.dbName = 'test.db.json';

import chai from 'chai';
import { Server } from 'http';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import request from 'supertest';
import { ApplicationDAO } from '../../src/dao';
import { app } from '../../src/services';

let server: Server;

before(() => {
    ApplicationDAO.getDB().addCollection('applications', {
        clone: true
    });

    const randomPort = Math.floor(Math.random() * (10000 - 5000) + 5000);
    server = app.listen(randomPort, () => {
        console.log(`Listening on port: ${randomPort}`);
    })
})

// Mocha hangs if every stream is not closed
after(() => {
    server.close();
    ApplicationDAO.getDB().close();
})

beforeEach(() => {
    ApplicationDAO.getApplicationsCollection().removeDataOnly();
    sinon.useFakeTimers(100);
})

afterEach(() => {
    sinon.restore();
})

describe('app.ts', () => {
    describe('POST /:group/:id', () => {
        it('should return 201 with an expected body', () => {
            const expected = {
                id: 'mock-id',
                group: 'mock-group',
                createdAt: 100,
                updatedAt: 100
            }

            return request(server)
                .post('/mock-group/mock-id')
                .set('Content-Type', 'application/json')
                .expect(res => {
                    return chai.expect(res.body)
                        .to.be.deep.equal(expected)
                })
                .expect('Content-Type', /json/)
                .expect(201)
        })

        it('should return 201 with metadata field', () => {
            const expected = {
                id: 'mock-id',
                group: 'mock-group',
                createdAt: 100,
                updatedAt: 100,
                metadata: {
                    mockField: 'mock-value'
                }
            }

            return request(server)
                .post('/mock-group/mock-id')
                .set('Content-Type', 'application/json')
                .send({ metadata: { mockField: 'mock-value' } })
                .expect(res => {
                    return chai.expect(res.body)
                        .to.be.deep.equal(expected)
                })
                .expect('Content-Type', /json/)
                .expect(201)
        })

        it('should return 200 with new updatedAt', async () => {
            const expected = {
                id: 'mock-id',
                group: 'mock-group',
                createdAt: 100,
                updatedAt: 200,
                metadata: {
                    mockField: 'mock-value'
                }
            }

            await request(server)
                .post('/mock-group/mock-id')
                .set('Content-Type', 'application/json')
                .expect(201)

            // Update timer, so next post will update only updatedAt and not
            // createdAt
            sinon.useFakeTimers(200);

            return request(server)
                .post('/mock-group/mock-id')
                .set('Content-Type', 'application/json')
                .send({ metadata: { mockField: 'mock-value' } })
                .expect(res => {
                    return chai.expect(res.body)
                        .to.be.deep.equal(expected)
                })
                .expect('Content-Type', /json/)
                .expect(200)
        })

        it('should return 400 for malformed body', () => {
            return request(server)
                .post('/mock-group/mock-id')
                .send({ notValid: 1 })
                .expect(400)
        })

    })

    describe('DELETE /:group/:id', () => {
        it('should return 200 ok', async () => {
            await request(server)
                .post('/mock-group/mock-id')
                .set('Content-Type', 'application/json')
                .expect(201)

            return request(server)
                .delete('/mock-group/mock-id')
                .expect('Content-Type', /json/)
                .expect(200)
        })


        it('should return 404 not found', async () => {
            return request(server)
                .delete('/mock-group/mock-id')
                .expect('Content-Type', /json/)
                .expect(404)
        })
    })

    describe('GET /', () => {
        it('should reuturn an array of group summaries', async () => {
            const expected = [
                {
                    group: 'mock-group-1',
                    instances: 2,
                    createdAt: 100,
                    lastUpdatedAt: 200,
                },
                {
                    group: 'mock-group-2',
                    instances: 1,
                    createdAt: 100,
                    lastUpdatedAt: 200,
                }
            ]

            await request(server)
                .post('/mock-group-1/mock-id-1')
                .set('Content-Type', 'application/json')
                .expect(201)

            await request(server)
                .post('/mock-group-1/mock-id-2')
                .set('Content-Type', 'application/json')
                .expect(201)

            await request(server)
                .post('/mock-group-2/mock-id-2')
                .set('Content-Type', 'application/json')
                .expect(201)

            // Update timer, so next post will update only updatedAt and not
            // createdAt
            sinon.useFakeTimers(200);

            await request(server)
                .post('/mock-group-1/mock-id-2')
                .set('Content-Type', 'application/json')
                .expect(200)

            await request(server)
                .post('/mock-group-2/mock-id-2')
                .set('Content-Type', 'application/json')
                .expect(200)

            return request(server)
                .get('/')
                .expect('Content-Type', /json/)
                .expect((res) => {
                    return chai.expect(res.body)
                        .to.have.deep.members(expected)
                })
                .expect(200)
        })

        it('should return an empty array', async () => {
            return request(server)
                .get('/')
                .expect('Content-Type', /json/)
                .expect((res) => {
                    return chai.expect(res.body)
                        .to.be.deep.equal([])
                })
                .expect(200)
        })
    })

    describe('GET /:group', () => {
        it('should return an array per group', async () => {
            const expected = [{
                id: 'mock-id',
                group: 'mock-group',
                createdAt: 100,
                updatedAt: 100
            }]

            await request(server)
                .post('/mock-group/mock-id')
                .set('Content-Type', 'application/json')
                .expect(201)

            return request(server)
                .get('/mock-group')
                .expect((res) => {
                    return chai.expect(res.body)
                        .to.be.deep.equal(expected)
                })
                .expect(200)
        })


        it('should return an empty array', () => {
            return request(server)
                .get('/mock-group')
                .expect('Content-Type', /json/)
                .expect((res) => {
                    return chai.expect(res.body)
                        .to.be.deep.equal([])
                })
                .expect(200)
        })
    })
})


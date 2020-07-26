import { Constants } from '../../src/constants';
// Override db name to use a test one
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
    ApplicationDAO.getDB().addCollection('applications', {
        clone: true
    });
    sinon.useFakeTimers(100);
})

afterEach(() => {
    ApplicationDAO.getDB().removeCollection('applications');
    sinon.restore();
})

describe('app.ts', () => {
    describe('POST /:group/:id', () => {
        it('should return 200 with an expected body', () => {
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
                    console.log(res.body)
                    return chai.expect(res.body)
                        .to.be.deep.equal(expected)
                })
                .expect('Content-Type', /json/)
                .expect(200)
        })

        it('should return 200 with metadata field', () => {
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
                .expect(200)
        })

        // it('should return 200 with new updatedAt', () => {
        //     const expected = {
        //         id: 'mock-id',
        //         group: 'mock-group',
        //         createdAt: 100,
        //         updatedAt: 100,
        //         metadata: {
        //             mockField: 'mock-value'
        //         }
        //     }

        //     request(server)
        //         .post('/mock-group/mock-id')
        //         .set('Content-Type', 'application/json')
        // })

        it('should return 400 for malformed body', () => {
            return request(server)
                .post('/mock-group/mock-id')
                .send({ notValid: 1 })
                .expect(400)
        })

    })

    describe('DELETE /:group/:id', () => {
        it('should return 200 ok', () => {
            request(server)
                .post('/mock-group/mock-id')
                .set('Content-Type', 'application/json')
                .expect(200)

            return request(server)
                .delete('/mock-group/mock-id')
                .expect('Content-Type', /json/)
                .expect(200)
        })


        it('should return 404 not found', () => {
            return request(server)
                .delete('/mock-group/mock-id')
                .expect('Content-Type', /json/)
                .expect(404)
        })
    })

    describe('GET /', () => {
        it('should return an empty array', () => {
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
        it('should return an array per group', () => {
            const expected = [{
                id: 'mock-id',
                group: 'mock-group',
                createdAt: 100,
                updatedAt: 100
            }]
            console.log('eeeeeeeeeeeeeeeee')

            request(server)
                .post('/mock-group/mock-id')
                .set('Content-Type', 'application/json')
                .expect(200)

            console.log('oooooooooooooooo')

            request(server)
                .get('/mock-group')
                .expect('Content-Type', /json/)
                .expect(res => {
                    console.log('iiiiiiiiiiiiiiiii')
                    console.log(JSON.stringify(res.body))
                })
                .expect(200)

            console.log('pppppppppppppppppp')

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


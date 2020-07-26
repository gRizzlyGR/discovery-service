import { Constants } from '../../src/constants';
// Override db name so to use a test one. MUST BE SET BEFORE IMPORTING DAO
Constants.dbName = 'test.db.json';

import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { ApplicationDAO } from '../../src/dao';
import { startSweeping } from '../../src/services';

before(() => {
    ApplicationDAO.getDB().addCollection('applications', {
        clone: true
    });
})

// Mocha hangs if every stream is not closed
after(() => {
    ApplicationDAO.getDB().close();
})

beforeEach(() => {
    sinon.useFakeTimers(100);
})

afterEach(() => {
    ApplicationDAO.getApplicationsCollection().removeDataOnly();
    sinon.restore();
})

describe('sweeper.ts', () => {
    describe('startSweeping', () => {
        
        it('should delete an expired application', () => {
            const applications = ApplicationDAO.getApplicationsCollection();
            
            const soonToExpire = {
                id: 'mock-id',
                group: 'mock-group',
                createdAt: 100,
                updatedAt: 100
            }
            
            applications.insert(soonToExpire);
            
            // Date.now() is now 200
            sinon.useFakeTimers(200);

            startSweeping(50, 0);

            const found = applications.findOne(soonToExpire);
            
            return expect(found).to.be.null;
        })

        it('should delete no application', () => {
            const applications = ApplicationDAO.getApplicationsCollection();

            const notExpiring = {
                id: 'mock-id',
                group: 'mock-group',
                createdAt: 100,
                updatedAt: 100
            }

            applications.insert(notExpiring);

            // Date.now() is now 200
            sinon.useFakeTimers(200);

            startSweeping(150, 0);

            const found = applications.findOne(notExpiring);

            return expect(notExpiring.id).to.be.equal(found!.id);
        })
    })
})
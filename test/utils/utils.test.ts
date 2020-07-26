import { expect } from 'chai';
import { describe, it } from 'mocha';
import { parseNumber } from '../../src/utils';

describe('utils.ts', () => {
    describe('parseNumber', () => {
        it('should successfully parse a string', () => {
            return expect(parseNumber("42", 0)).is.equal(42);
        })

        it('should return default number for NaN', () => {
            return expect(parseNumber("not a number", 42)).is.equal(42);
        })

        it('should return default number for undefined', () => {
            return expect(parseNumber(undefined, 42)).is.equal(42);
        })
    })
})
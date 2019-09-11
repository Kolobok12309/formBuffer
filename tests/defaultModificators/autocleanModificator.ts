import { assert } from 'chai';

import autocleanModificator from './../../lib/defaultModificators/autocleanModificator';
import formBufferSymbols from '../../lib/symbols';
import FormBuffer from '../../lib';

const { outFormater } = autocleanModificator;

describe('autocleanModificator', () => {
    const buffer = new FormBuffer({ preset: { test: {} } });
    function testFormater(value: any) {
        if (!outFormater) throw new Error('Formater undefined');
        return outFormater(null, value, buffer, formBufferSymbols);
    }
    it('Should have name autoclean and global: true and formater', () => {
        assert.equal(autocleanModificator.name, 'autoclean');
        assert.isTrue(autocleanModificator.canBeGlobal);
        assert.exists(outFormater);
        assert.isFunction(outFormater);
    });
    describe('outFormater', () => {
        it('should return delSymbol', () => {
            const testVals = ['', null, undefined, [], {}, NaN, 0];

            testVals.forEach((value) => {
                const result = testFormater(value);

                assert.equal(result, formBufferSymbols.delSymbol);
            });
        });
        it('should return value', () => {
            const testVals = ['test', { test: 'tes' }, [123], 123, -5, Infinity];

            testVals.forEach((value) => {
                const result = testFormater(value);

                assert.equal(result, value);
            });
        });
    });
});

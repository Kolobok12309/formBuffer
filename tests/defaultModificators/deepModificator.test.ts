import { assert } from 'chai';

import deepModificator from '../../lib/defaultModificators/deepModificator';
import formBufferSymbols from '../../lib/symbols';
import FormBuffer from '../../lib';

const { inFormater, outFormater } = deepModificator;

describe('deepModificator', () => {
    const buffer = new FormBuffer({ preset: { test: { type: String } } });
    function testInFormater(value: any) {
        if (!inFormater) throw new Error('inFormater undefined');
        return inFormater(null, value, true, buffer, formBufferSymbols);
    }
    function testOutFormater(value: any) {
        if (!outFormater) throw new Error('outFormater undefined');
        return outFormater(value, true, buffer, formBufferSymbols);
    }
    it('Should have name default and formater', () => {
        assert.equal(deepModificator.name, 'deep');
        assert.exists(inFormater);
        assert.exists(outFormater);
        assert.isFunction(inFormater);
        assert.isFunction(outFormater);
    });

    describe('inFormater', () => {
        it('Should return arrays', () => {
            const testArrs = [[1, 2, 3], ['dsad'], [false]];

            testArrs.forEach((testArr) => {
                const result = testInFormater(testArr);

                assert.notEqual(result, testArr);
                assert.deepEqual(result, testArr);
            });
        });
        it('Should return objects', () => {
            const testObjs = [{}, { name: '' }, { tset: 123 }, { tst: false }];

            testObjs.forEach((testObj) => {
                const result = testInFormater(testObj);

                assert.notEqual(result, testObj);
                assert.deepEqual(result, testObj);
            });
        });
        it('Should throw errors on wrong types(string, boolean etc)', () => {
            const testElems = [Symbol(), '', 'test', 123, false, true, null, NaN, undefined, () => {}];
            const errorText = '[DeepModificator] value would be a valid json object/array';

            testElems.forEach((elem) => {
                assert.throws(() => {
                    testInFormater(elem);
                },            errorText);
            });
        });
    });
    describe('outFormater', () => {
        it('Should return arrays', () => {
            const testArrs = [[1, 2, 3], ['dsad'], [false]];

            testArrs.forEach((testArr) => {
                const result = testOutFormater(testArr);

                assert.notEqual(result, testArr);
                assert.deepEqual(result, testArr);
            });
        });
        it('Should return objects', () => {
            const testObjs = [{}, { name: '' }, { tset: 123 }, { tst: false }];

            testObjs.forEach((testObj) => {
                const result = testOutFormater(testObj);

                assert.notEqual(result, testObj);
                assert.deepEqual(result, testObj);
            });
        });
        it('Should throw errors on wrong types(string, boolean etc)', () => {
            const testElems = [Symbol(), '', 'test', 123, false, true, null, NaN, undefined, () => {}];
            const errorText = '[DeepModificator] value would be a valid json object/array';

            testElems.forEach((elem) => {
                assert.throws(() => {
                    testOutFormater(elem);
                },            errorText);
            });
        });
    });
});

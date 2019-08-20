import { assert } from 'chai';
import { fake } from 'sinon';

import defaultModificator from '../../lib/defaultModificators/defaultModificator';
import FormBuffer from '../../lib';

const { defaultFormater } = defaultModificator;

describe('defaultModificator', () => {
    const buffer = new FormBuffer({ preset: { test: {} } });
    function testFormater(value: any) {
        if (!defaultFormater) throw new Error('Formater undefined');
        return defaultFormater(null, value, buffer);
    }
    it('Should have name default and global: false and formater', () => {
        assert.equal(defaultModificator.name, 'default');
        assert.equal(defaultModificator.canBeGlobal, false);
        assert.exists(defaultFormater);
        assert.isFunction(defaultFormater);
    });
    describe('defaultFormater', () => {
        it('Should return args', () => {
            const myArgs = ['', 'saf', 0, 153, {}, [], true, false, Symbol()];

            myArgs.forEach((arg) => {
                const formaterResult = testFormater(arg);
                assert.equal(formaterResult, arg);
            });
        });

        it('Should invoke functions', () => {
            const myArgs = ['', 'saf', 0, 153, {}, [], true, false, Symbol()];
            const myFuncs = myArgs.map(arg => fake.returns(arg));

            myFuncs.forEach((func, index) => {
                const formaterResult = testFormater(func);
                assert.equal(formaterResult, myArgs[index]);
            });
            myFuncs.forEach(func => assert.equal(func.callCount, 1));
            myFuncs.forEach((func, index) => {
                const formaterResult = testFormater(func);
                assert.equal(formaterResult, myArgs[index]);
            });
            myFuncs.forEach(func => assert.equal(func.callCount, 2));
        });

        it('Should return unique objs', () => {
            const testObj = { test: '123' };

            const myFuncObj = () => ({ test: '123' });

            const firstCalledResult = testFormater(myFuncObj);
            assert.deepEqual(firstCalledResult, testObj);

            const secondCalledResult = testFormater(myFuncObj);
            assert.deepEqual(secondCalledResult, testObj);
            assert.deepEqual(firstCalledResult, secondCalledResult);

            assert.notEqual(firstCalledResult, secondCalledResult);
        });

        it('Should return unique arrs', () => {
            const testArr = [123];

            const myFuncArr = () => [123];

            const firstCalledResult = testFormater(myFuncArr);
            assert.deepEqual(firstCalledResult, testArr);

            const secondCalledResult = testFormater(myFuncArr);
            assert.deepEqual(secondCalledResult, testArr);
            assert.deepEqual(firstCalledResult, secondCalledResult);

            assert.notEqual(firstCalledResult, secondCalledResult);
        });
    });
});

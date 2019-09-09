import { FormBufferOptions } from './../../lib/types/index';
import { assert } from 'chai';
import sinon from 'sinon';

import typeModificator from '../../lib/defaultModificators/typeModificator';
import FormBuffer from '../../lib';

interface TestData {
    value?: any;
    options: any;
    return: any;
    deepEqual?: boolean;
}

type TestArr = TestData[];

afterEach(() => {
    sinon.restore();
});

describe('typeModificator', () => {
    const buffer = new FormBuffer({ preset: { test: {} } });
    function testFormater(options: any, value?: any) {
        if (!typeModificator.defaultFormater) throw new Error('Formater undefined');
        return typeModificator.defaultFormater(value, options, buffer);
    }
    it('Should have name default and global: false and formater', () => {
        assert.equal(typeModificator.name, 'type');
        assert.equal(typeModificator.canBeGlobal, false);
        assert.exists(typeModificator.defaultFormater);
        assert.isFunction(typeModificator.defaultFormater);
    });
    describe('defaultFormater', () => {
        describe('smartConfig', () => {
            it('Should return primitives', () => {
                const testArr: TestArr = [
                    {
                        options: String,
                        return: '',
                    },
                    {
                        options: Number,
                        return: 0,
                    },
                    {
                        options: Boolean,
                        return: false,
                    },
                ];

                testArr.forEach((data) => {
                    assert.equal(testFormater(data.options, data.value), data.return);
                });
            });

            it('Should return unique Arr', () => {
                const testArr: any[] = [];

                const firstResult = testFormater(Array) as any[];
                const secondResult = testFormater(Array) as any[];

                assert.deepEqual(firstResult, testArr);
                assert.deepEqual(secondResult, testArr);
                assert.deepEqual(firstResult, secondResult);

                assert.notEqual(firstResult, secondResult);
            });

            it('Should return unique Objs', () => {
                const testObj = {};

                const firstResult = testFormater(Object);
                const secondResult = testFormater(Object);

                assert.deepEqual(firstResult, testObj);
                assert.deepEqual(secondResult, testObj);
                assert.deepEqual(firstResult, secondResult);

                assert.notEqual(firstResult, secondResult);
            });

            it('Should throw error on unacceptable type', () => {
                const errorText = '[TypeModificator] type not supported';

                const testedTypes = [0, '', '214', {}, [], null, undefined];
                const funcs = testedTypes.map(arg => () => testFormater(arg));

                funcs.forEach((func) => {
                    assert.throws(func, errorText);
                });
            });

            it('Should throw error on FormBuffer haven\'t config', () => {
                const errorText = '[TypeModificator] FormBuffer haven\'t config';

                assert.throws(() => testFormater(FormBuffer), errorText);
            });
        });
        describe('bigConfig', () => {
            it('Should return primitives', () => {
                const testArr: TestArr = [
                    {
                        options: String,
                        return: '',
                    },
                    {
                        options: Number,
                        return: 0,
                    },
                    {
                        options: Boolean,
                        return: false,
                    },
                ];

                testArr.forEach((data) => {
                    assert.equal(testFormater({ type: data.options }, data.value), data.return);
                });
            });

            it('Should return unique Arr', () => {
                const testArr: any[] = [];

                const firstResult = testFormater({ type: Array }) as any[];
                const secondResult = testFormater({ type: Array }) as any[];

                assert.deepEqual(firstResult, testArr);
                assert.deepEqual(secondResult, testArr);
                assert.deepEqual(firstResult, secondResult);

                assert.notEqual(firstResult, secondResult);
            });

            it('Should return unique Objs', () => {
                const testObj = {};

                const firstResult = testFormater({ type: Object });
                const secondResult = testFormater({ type: Object });

                assert.deepEqual(firstResult, testObj);
                assert.deepEqual(secondResult, testObj);
                assert.deepEqual(firstResult, secondResult);

                assert.notEqual(firstResult, secondResult);
            });

            type TestPreset = {
                test1: boolean;
                test2: string;
                test3: number;
            };
            const testConfig: FormBufferOptions<TestPreset> = {
                preset: {
                    test1: {
                        type: Boolean,
                    },
                    test2: {
                        type: String,
                    },
                    test3: {
                        type: Number,
                    },
                },
            };

            it('Should return new formbuffer', () => {
                const clearFake = sinon.fake();

                sinon.replace(FormBuffer.prototype, 'clear', clearFake);

                const result = testFormater({ type: FormBuffer, options: testConfig });

                assert.instanceOf(result, FormBuffer);
                assert.isFalse(clearFake.calledOnce);
            });

            it('Should return cleared data from formBuffer', () => {
                const clearFake = sinon.fake();

                sinon.replace(FormBuffer.prototype, 'clear', clearFake);
                testFormater(FormBuffer, new FormBuffer(testConfig));

                assert.isTrue(clearFake.calledOnce);
            });

            it('Should throw error on unacceptable type', () => {
                const errorText = '[TypeModificator] type not supported';

                const testedTypes = [0, '', '214', {}, [], null, undefined];
                const funcs = testedTypes.map(arg => () => testFormater({ type: arg }));

                funcs.forEach((func) => {
                    assert.throws(func, errorText);
                });
            });

            it('Should throw error on FormBuffer haven\'t config', () => {
                const errorText = '[TypeModificator] FormBuffer haven\'t config';

                assert.throws(() => testFormater({ type: FormBuffer }), errorText);
            });
        });
        describe('changingTypes', () => {
            const testType = 'testType';

            it('addType', () => {
                typeModificator.addType({
                    type: testType,
                    formater: () => testType,
                });

                const result = testFormater(testType);

                assert.equal(testType, result);
                assert.isOk(typeModificator.getTypeFormater(testType));
            });
            it('removeType', () => {
                typeModificator.removeType(testType);

                assert.throws(() => {
                    testFormater(testType)
                },            '[TypeModificator] type not supported');
                assert.isUndefined(typeModificator.getTypeFormater(testType));
            });
        });
    });
});

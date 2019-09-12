import { assert } from 'chai';
import sinon from 'sinon';

import FormBuffer, { optionsSymbol, skipSymbol, delSymbol } from './../lib';

afterEach(() => {
    sinon.restore();
});

describe('FormBuffer', () => {
    describe('constructor', () => {
        it('options', () => {
            const setFake = sinon.fake();
            sinon.replace(FormBuffer.prototype, 'setValues', setFake);

            const requiredProps = ['defaultFormaters', 'global', 'inFormaters', 'outFormaters', 'preset'];
            const isGoodOptions = (obj: any): boolean => {
                let result = requiredProps.every(propName => obj[propName]);
                if (obj.preset && typeof obj.preset !== 'object' || Array.isArray(obj.preset) || obj.preset === null) result = false;
                return result;
            };

            const badOptions = [
                { test: '' },
                { preset: null, defaultFormaters: {}, inFormaters: {}, global: {}, outFormaters: {} },
                { preset: [], defaultFormaters: {}, inFormaters: {}, global: {}, outFormaters: {} },
                { defaultFormaters: {}, inFormaters: {}, global: {}, outFormaters: {} },
            ];
            const middleOptions = [
                { preset: { test: 'test' } },
                { preset: {}, deaultFormaters: {}, inFormaters: {}, global: {}, outFormaters: {} },
            ];
            const goodOptions = [
                { preset: {}, defaultFormaters: {}, inFormaters: {}, global: {}, outFormaters: {} },
                { preset: { test: 'testst' }, defaultFormaters: { test: 'test' }, inFormaters: {}, global: {}, outFormaters: {} },
            ];

            [...badOptions, ...middleOptions].forEach((options) => {
                assert.isFalse(isGoodOptions(options));
            });

            goodOptions.forEach((options) => {
                assert.isTrue(isGoodOptions(options));
            });

            badOptions.forEach((options) => {
                const buffer = new FormBuffer(options as any);

                assert.isFalse(isGoodOptions(buffer[optionsSymbol]));
            });
            [...middleOptions, ...goodOptions].forEach((options) => {
                const buffer = new FormBuffer(options as any);

                assert.isTrue(isGoodOptions(buffer[optionsSymbol]));
            });

            assert.strictEqual(setFake.callCount, badOptions.length + goodOptions.length + middleOptions.length);
        });
        it('call setValues', () => {
            const setFake = sinon.fake();
            sinon.replace(FormBuffer.prototype, 'setValues', setFake);

            for (let i = 0; i < 20; i++) {
                new FormBuffer({} as any);
            }

            assert.strictEqual(20, setFake.callCount);
        });
    });
    describe('extend', () => {
        it('call constructor', () => {
            const setFake = sinon.fake();
            sinon.replace(FormBuffer.prototype, 'setValues', setFake);

            const objs = [
                { preset: { test: { type: String }, test2: { type: Number }, test3: { type: Boolean } } },
                { preset: { test: { type: Boolean }, test2: { type: Boolean } } },
                { preset: { test: { type: String, test2: { type: Object } } }, global: { autoclean: true } },
            ];

            objs.forEach((options) => {
                const buffer = new FormBuffer(options);
                const extendedBuffer = FormBuffer.extend(options);

                assert.deepEqual(buffer, extendedBuffer);
            });

            assert.strictEqual(setFake.callCount, objs.length * 2);
        });
    });
    describe('CRUD Modificators', () => {
        it('modificators', () => {
            const firstModifs = FormBuffer.modificators;
            const secondModifs = FormBuffer.modificators;

            assert.strictEqual(firstModifs, secondModifs);
            assert.instanceOf(firstModifs, Map);
        });
        it('addModificator', () => {
            const setFake = sinon.fake();
            sinon.replace(Map.prototype, 'set', setFake);

            FormBuffer.addModificator({} as any);
            FormBuffer.addModificator({} as any);
            FormBuffer.addModificator({} as any);

            assert.isTrue(setFake.calledThrice);
        });
        it('delModificator', () => {
            const testString = 'testValue';
            const delFake = sinon.fake.returns(testString);
            sinon.replace(Map.prototype, 'delete', delFake);

            for (let i = 0; i < 5; i++) {
                const result = FormBuffer.delModificator('');
                assert.strictEqual(result as any, testString);
            }

            assert.strictEqual(5, delFake.callCount);
        });
        it('getModificator', () => {
            const goodNames = ['deep', 'autoclean', 'default', 'type'];
            const badNames = ['test', 'fsdfsd', 5, {}, null];

            goodNames.forEach((name) => {
                const result = FormBuffer.getModificator(name);
                assert.exists(result);
            });
            badNames.forEach((name) => {
                const result = FormBuffer.getModificator(name as string);
                assert.notExists(result);
            });

            const getFake = sinon.fake();
            sinon.replace(Map.prototype, 'get', getFake);

            goodNames.forEach((name) => {
                FormBuffer.getModificator(name);
            });

            assert.strictEqual(goodNames.length, getFake.callCount);
        });
    });
    describe('setValues', () => {
        it('call clear on bad data', () => {
            const badDataArr = [null, undefined, 0, 123, '', '213', [], [123], () => {}];

            const testBuffer = new FormBuffer({ preset: { test: { type: String } } });

            const clearFake = sinon.fake();
            sinon.replace(FormBuffer.prototype, 'clear', clearFake);

            badDataArr.forEach((data) => {
                testBuffer.setValues(data as any);
            });

            assert.strictEqual(clearFake.callCount, badDataArr.length);
        });
        it('not call clear on objects', () => {
            const goodDataArr = [{}, { test: '' }, { sfdsf: '' }];

            const testBuffer = new FormBuffer({ preset: { test: { type: String } } });

            const clearFake = sinon.fake();
            sinon.replace(FormBuffer.prototype, 'clear', clearFake);

            goodDataArr.forEach((data) => {
                testBuffer.setValues(data as any);
            });

            assert.isFalse(clearFake.called);
        });
        it('throw err on reserved prop names', () => {
            const errorMsg = /\[FormBuffer\] Property name cannot have ".*/;
            const presets = [
                { clear: '' },
                { clearProperty: '' },
                { _getModificatorsForProp: '' },
                { setValues: '' },
            ];

            presets.forEach((preset) => {
                assert.throws(() => new FormBuffer({ preset }, {}), errorMsg);
            });
        });
        it('call clearProperty if prop not in data', () => {
            const testBuffer = new FormBuffer({ preset: {
                test: { type: String },
                test2: { default: 123 },
            }});

            const clearFake = sinon.fake();
            sinon.replace(FormBuffer.prototype, 'clearProperty', clearFake);

            testBuffer.setValues({});
            assert.isTrue(clearFake.calledTwice);

            testBuffer.setValues({ test: '' });
            assert.isTrue(clearFake.calledThrice);

            testBuffer.setValues({ test: '', test2: '' });
            assert.isTrue(clearFake.calledThrice);

            testBuffer.setValues({ a:'', b: '', c: '' });
            assert.strictEqual(5, clearFake.callCount);
        });
        it('not call clearProperty if prop in data', () => {
            const testBuffer = new FormBuffer({ preset: {
                test: { type: String },
                test2: { type: String },
                test3: { type: String },
                test4: { type: String },
            }});

            const clearFake = sinon.fake();
            sinon.replace(FormBuffer.prototype, 'clearProperty', clearFake);

            testBuffer.setValues({ test: '', test2: '', test3: '', test4: '' });
            testBuffer.setValues({ 34543: '', test: '', test2: '', test3: '', test4: '' });
            testBuffer.setValues({ testtestes: '', test: '', test2: '', test3: '', test4: '' });
            testBuffer.setValues({ [Symbol()]: '', test: '', test2: '', test3: '', test4: '' });

            assert.isTrue(clearFake.notCalled);
        });
        it('testInFormater', () => {
            const testString = 'dssfdsfdsfdsfdsfdsfsd';
            const inFormater = sinon.fake.returns(testString);

            const testBuffer = FormBuffer.extend({
                preset: { test: { type: String } },
                inFormaters: {
                    test: inFormater,
                },
            });

            let arg = {};
            testBuffer.setValues({ test: arg });
            assert.strictEqual(inFormater.lastCall.args[0], '');
            assert.strictEqual(inFormater.lastCall.args[1], arg);
            assert.strictEqual(testBuffer.test, testString);

            testBuffer.test = 214;

            arg = [];
            testBuffer.setValues({ test: arg });
            assert.strictEqual(inFormater.lastCall.args[0], 214);
            assert.strictEqual(inFormater.lastCall.args[1], arg);
            assert.strictEqual(testBuffer.test, testString);

            assert.strictEqual(inFormater.callCount, 2);
        });
        it('test modificatorInFormater', () => {
            const skipFake = sinon.fake.returns(skipSymbol);
            const normalFake = sinon.fake.returns('test');

            const getModifFake = sinon.fake.returns(new Map([
                ['1', { modificator: { inFormater: skipFake }, options: 'skip1' }],
                ['2', { modificator: { inFormater: normalFake }, options: 'normal2' }],
                ['3', { modificator: { inFormater: normalFake }, options: 'normal3' }],
                ['4', { modificator: { inFormater: skipFake }, options: 'skip4' }],
            ]));

            const testBuffer = FormBuffer.extend({
                preset: {
                    test1: {
                        default: 'test1',
                    },
                    test2: {
                        default: 'test2',
                    },
                },
            });
            sinon.replace(FormBuffer.prototype as any, '_getModificatorsForProp', getModifFake);

            testBuffer.setValues({ test1: '', test2: '' });
            assert.isTrue(getModifFake.calledTwice);

            assert.isTrue(skipFake.calledTwice);
            assert.isTrue(normalFake.calledTwice);
            assert.strictEqual(testBuffer.test1, 'test');
            assert.strictEqual(testBuffer.test2, 'test');
        });
    });
    describe('_getModificatorsForProp', () => {
        it('getModifs by options', () => {
            const testString = 'FakeModificator';
            const getModifFake = sinon.fake.returns(testString);

            sinon.replace(FormBuffer, 'getModificator', getModifFake);

            function getModifsTest(options: any, propKey: string) {
                const testObj = {
                    [optionsSymbol]: options,
                };
                return ((FormBuffer.prototype as any)._getModificatorsForProp as any).call(testObj, propKey);
            }

            const testOptions = [
                {
                    options: {
                        preset: {
                            test1: {
                                deep: true,
                                autoclean: true,
                            },
                            test2: {
                                deep: false,
                                default: 'test2',
                            },
                            test3: {
                                type: Boolean,
                                autoclean: false,
                            },
                        },
                        global: {
                            deep: true,
                            type: String,
                        },
                    },
                    valids: [
                        {
                            key: 'test1',
                            modifs: {
                                deep: true,
                                autoclean: true,
                                type: String,
                            },
                        },
                        {
                            key: 'test2',
                            modifs: {
                                deep: false,
                                default: 'test2',
                                type: String,
                            },
                        },
                        {
                            key: 'test3',
                            modifs: {
                                type: Boolean,
                                autoclean: false,
                                deep: true,
                            },
                        },
                    ],
                },
                {
                    options: {
                        preset: {
                            test1: {},
                            test2: {
                                deep: true,
                                type: true,
                                default: true,
                                blabla: true,
                            },
                        },
                        global: {
                            global: true,
                            deep: false,
                            type: false,
                        },
                    },
                    valids: [
                        {
                            key: 'test1',
                            modifs: {
                                global: true,
                                deep: false,
                                type: false,
                            },
                        },
                        {
                            key: 'test2',
                            modifs: {
                                deep: true,
                                type: true,
                                default: true,
                                blabla: true,
                                global: true,
                            },
                        },
                    ],
                },
            ];

            testOptions.forEach(({ options, valids }) => {
                valids.forEach((validSchema: any) => {
                    const schemaFromFunc = getModifsTest(options, validSchema.key);

                    Object.keys(validSchema.modifs).forEach((key) => {
                        const modifAndOptions = schemaFromFunc.get(key);
                        assert.exists(modifAndOptions);

                        assert.strictEqual(modifAndOptions.modificator, testString);
                        assert.strictEqual(modifAndOptions.options, (validSchema.modifs as any)[key]);
                    });
                });
            });
        });
    });
    describe('clear', () => {
        it('call clearProperty right times', () => {
            const arrTimes = [1, 4, 5, 7, 10, 0, 3];
            const generPreset = (times: number) => {
                const result: any = {};
                for (let i = 0; i < times; i++) {
                    result[`test${i}`] = {
                        default: '',
                    };
                }
                return result;
            };

            arrTimes.forEach((times) => {
                const clearPropStub = sinon.stub(FormBuffer.prototype, 'clearProperty');

                new FormBuffer({ preset: generPreset(times) });

                assert.strictEqual(times, clearPropStub.callCount);

                clearPropStub.restore();
            });
        });
    });
    describe('clearProperty', () => {
        it('test defaultFormater', () => {
            const testString = 'fdsfsdfdsfdsfdsfdsf';

            const skipFake = sinon.fake.returns(skipSymbol);
            const normalFake = sinon.fake.returns(testString);

            const getModifFake = sinon.fake.returns(new Map([
                ['1', { modificator: { defaultFormater: skipFake }, options: 'skip1' }],
                ['2', { modificator: { defaultFormater: normalFake }, options: 'normal2' }],
                ['3', { modificator: { defaultFormater: normalFake }, options: 'normal3' }],
                ['4', { modificator: { defaultFormater: skipFake }, options: 'skip4' }],
            ]));

            const defaultFormater = sinon.fake.returns(testString);
            const notCalledFormater = sinon.fake();

            sinon.replace(FormBuffer.prototype as any, '_getModificatorsForProp', getModifFake);

            const testBuffer = FormBuffer.extend({
                preset: {
                    test: {},
                    test3: {},
                },
                defaultFormaters: {
                    test: defaultFormater,
                    test2: notCalledFormater,
                    test3: defaultFormater,
                },
            } as any);

            assert.isTrue(defaultFormater.calledTwice);
            assert.strictEqual(defaultFormater.lastCall.args[0], undefined);

            const result = testBuffer.clearProperty('test');
            assert.strictEqual(result, testString);
            assert.isTrue(defaultFormater.calledThrice);
            assert.strictEqual(defaultFormater.lastCall.args[0], testString);

            assert.isTrue(notCalledFormater.notCalled);
            assert.isTrue(skipFake.notCalled);
            assert.isTrue(normalFake.notCalled);
        });
        it('test modifDefaultFormater', () => {
            const testString = 'fdskfndsjgnk;f;k';
            const skipFake = sinon.fake.returns(skipSymbol);
            const normalFake = sinon.fake.returns(testString);

            const getModifFake = sinon.fake.returns(new Map([
                ['1', { modificator: { defaultFormater: skipFake }, options: 'skip1' }],
                ['2', { modificator: { defaultFormater: normalFake }, options: 'normal2' }],
                ['3', { modificator: { defaultFormater: normalFake }, options: 'normal3' }],
                ['4', { modificator: { defaultFormater: skipFake }, options: 'skip4' }],
            ]));

            const testBuffer = FormBuffer.extend({
                preset: {
                    test1: {
                        default: 'test1',
                    },
                    test2: {
                        default: 'test2',
                    },
                },
            });
            sinon.replace(FormBuffer.prototype as any, '_getModificatorsForProp', getModifFake);

            testBuffer.clear();
            assert.isTrue(getModifFake.calledTwice);

            assert.isTrue(skipFake.calledTwice);
            assert.isTrue(normalFake.calledTwice);
            assert.strictEqual(testBuffer.test1, testString);
            assert.strictEqual(testBuffer.test2, testString);
        });
        it('throw error when haven\'t default', () => {
            const errorMsg = /^\[FormBuffer\] prop ".*" haven't default value$/;
            const testBuffer = FormBuffer.extend({
                preset: {
                    test1: {
                        default: '',
                    },
                    test2: {
                        default: '',
                    },
                    test3: {
                        default: '',
                    },
                    test4: {
                        default: '',
                    },
                },
            });

            for (let i = 1; i < 5; i++) {
                (testBuffer[optionsSymbol].preset as any)[`test${i}`] = {};
                assert.throws(() => {
                    testBuffer.clearProperty(`test${i}` as any);
                },            errorMsg);
            }
        });
    });
    describe('getFormData', () => {
        describe('test outFormater', () => {
            it('test normal values', () => {
                const testString = 'fdsfsdfdsfdsfdsfdsf';

                const skipFake = sinon.fake.returns(skipSymbol);
                const normalFake = sinon.fake.returns(testString);

                const testBuffer = FormBuffer.extend({
                    preset: {
                        test: {
                            default: '',
                        },
                        test3: {
                            default: true,
                        },
                        test4: {
                            default: false,
                        },
                        test5: {
                            default: 123,
                        },
                    },
                    outFormaters: {
                        test: skipFake,
                        test3: normalFake,
                        test4: skipFake,
                        test5: normalFake,
                    },
                });

                const resultedObject = {
                    test: '',
                    test3: testString,
                    test4: false,
                    test5: testString,
                };

                const formated = testBuffer.getFormData();

                assert.deepEqual(formated, resultedObject);

                assert.isTrue(skipFake.calledTwice);
                assert.isTrue(normalFake.calledTwice);
            });
            it('test del symbol', () => {
                const testString = 'fdsfsdfdsfdsfdsfdsf';

                const delFake = sinon.fake.returns(delSymbol);
                const skipFake = sinon.fake.returns(skipSymbol);
                const normalFake = sinon.fake.returns(testString);

                const testBuffer = FormBuffer.extend({
                    preset: {
                        test: {
                            default: '',
                            autoclean: true,
                        },
                        test3: {
                            default: true,
                        },
                        test4: {
                            default: false,
                        },
                        test5: {
                            default: 123,
                        },
                    },
                    outFormaters: {
                        test: skipFake,
                        test3: normalFake,
                        test4: delFake,
                        test5: normalFake,
                    },
                });

                const resultedObject = {
                    test3: testString,
                    test5: testString,
                };

                const formated = testBuffer.getFormData();

                assert.deepEqual(formated, resultedObject as any);

                assert.isTrue(delFake.calledOnce);
                assert.isTrue(skipFake.calledOnce);
                assert.isTrue(normalFake.calledTwice);
            });
        });
        it('test modifOutFormater', () => {
            const delFake = sinon.fake.returns(delSymbol);
            const skipFake = sinon.fake.returns(skipSymbol);

            const getModifFake = sinon.fake.returns(new Map([
                ['1', { modificator: { outFormater: skipFake }, options: 'skip1' }],
                ['2', { modificator: { outFormater: skipFake }, options: 'normal2' }],
                ['3', { modificator: { outFormater: delFake }, options: 'normal3' }],
                ['4', { modificator: { outFormater: skipFake }, options: 'skip4' }],
            ]));

            const testBuffer = FormBuffer.extend({
                preset: {
                    test: { default: '' },
                    test2: { default: '' },
                    test3: { default: '' },
                    test4: { default: '' },
                },
                outFormaters: {
                    test: skipFake,
                    test2: skipFake,
                    test3: skipFake,
                    test4: skipFake,
                },
            });

            sinon.replace(FormBuffer.prototype as any, '_getModificatorsForProp', getModifFake);

            const formated = testBuffer.getFormData();

            assert.deepEqual(formated, {} as any);
            assert.strictEqual(skipFake.callCount, 12);
            assert.strictEqual(delFake.callCount, 4);
        });
        it('revise values with default modificators', () => {
            const optionsArr = [
                {
                    options: {
                        preset: {
                            test1: {
                                default: 'test',
                                autoclean: true,
                            },
                            test2: {
                                default: () => [123],
                            },
                            test3: {
                                type: String,
                                autoclean: true,
                            },
                            test4: {
                                type: String,
                            },
                        },
                    },
                    valid: {
                        test1: 'test',
                        test2: [123],
                        test4: '',
                    },
                },
                {
                    options: {
                        preset: {
                            test1: {
                                type: {
                                    type: FormBuffer,
                                    options: {
                                        preset: {
                                            test: {
                                                default: 'test',
                                            },
                                            test2: {
                                                type: Boolean,
                                            },
                                        },
                                    },
                                },
                            },
                            test2: {
                                default: () => false,
                            },
                            test3: {
                                type: Object,
                            },
                        },
                    },
                    valid: {
                        test1: {
                            test: 'test',
                            test2: false,
                        },
                        test2: false,
                        test3: {},
                    },
                },
                {
                    options: {
                        preset: {
                            test: {
                                type: String,
                            },
                            test2: {},
                            test3: {
                                type: Object,
                            },
                            test4: {
                                default: () => [-1],
                            },
                            test5: {
                                default: null,
                                autoclean: true,
                            },
                        },
                        defaultFormaters: {
                            test2: () => '21434',
                            test3: () => skipSymbol,
                        },
                    },
                    valid: {
                        test: '',
                        test2: '21434',
                        test3: {},
                        test4: [-1],
                    },
                },
                {
                    options: {
                        preset: {
                            test1: {},
                            test2: {},
                            test3: {},
                            test4: {},
                        },
                        global: {
                            default: () => [123, 123, 123],
                        },
                        outFormaters: {
                            test4: () => delSymbol,
                        },
                    },
                    valid: {
                        test1: [123, 123, 123],
                        test2: [123, 123, 123],
                        test3: [123, 123, 123],
                    },
                },
            ];

            optionsArr.forEach(({ options, valid }) => {
                const buffer = new FormBuffer(options as any);
                const result = buffer.getFormData();

                assert.deepEqual(result, valid as any);
            });
        });
    });
});

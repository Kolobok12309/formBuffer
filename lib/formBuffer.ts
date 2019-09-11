import { IModificator, ModificatorsNames, PartialModificators } from './types/modificators';
import { Modificators, FormBufferOptions, FormBufferInsideOptions, inFormater, ValueOfPreset, TypedModificatorOptions } from './types';

import formBufferSymbols, { optionsSymbol, skipSymbol, delSymbol } from './symbols';

import defaultModificator from './defaultModificators/defaultModificator';
import deepModificator from './defaultModificators/deepModificator';
import autocleanModificator from './defaultModificators/autocleanModificator';
import typeModificator from './defaultModificators/typeModificator';

function fixOptions<P, M extends Modificators>(options: FormBufferOptions<P, M>): FormBufferInsideOptions<P, M> {
    if (!options.defaultFormaters) options.defaultFormaters = {};
    if (!options.global) options.global = {};
    if (!options.inFormaters) options.inFormaters = {};
    if (!options.outFormaters) options.outFormaters = {};

    return options as FormBufferInsideOptions<P, M>;
}

const modificators: Map<string, IModificator<any, any>> = new Map([
    defaultModificator,
    deepModificator,
    autocleanModificator,
    typeModificator,
].map(modif => [modif.name, modif]));

export default class FormBuffer<P = any, M extends Modificators = Modificators> {
    [optionsSymbol]: FormBufferInsideOptions<P, M>;

    constructor(options: FormBufferOptions<P, M>, data?: P) {
        this[optionsSymbol] = fixOptions(options);

        this.setValues(data);
    }

    static extend<P = any, M extends Modificators = Modificators>(options: FormBufferOptions<P, M>, data?: P): FormBufferExtended<P, M> {
        const buffer = new FormBuffer(options, data);

        return buffer as FormBufferExtended<P, M>;
    }

    static addModificator<M extends Modificators = Modificators>(modificator: IModificator<M>) {
        modificators.set(modificator.name, modificator);
    }

    static delModificator(modificatorName: string) {
        modificators.delete(modificatorName);
    }

    static getModificator<M extends Modificators = Modificators>(modificatorName: string): IModificator<M> | undefined {
        return modificators.get(modificatorName);
    }

    setValues(data: P | null | undefined) {
        if (data && typeof data === 'object') {
            const options = this[optionsSymbol];

            // const dataKeys = Object.keys(data);
            // const presetKeys = Object.keys(options.preset);

            // const allKeysSet = new Set([...dataKeys, ...presetKeys]);

            for (const key in options.preset) {
                if (key in FormBuffer.prototype) throw new Error(`[FormBuffer] Property name cannot have "${key}" value because it reserved`);

                let value = data[key];
                const oldValue = (this as any)[key];

                const formater = options.inFormaters[key];
                if (key in data) {
                    if (formater) {
                        value = formater(oldValue, value, this, formBufferSymbols);
                    } else {
                        const getResultFromModificator = (modificatorName: string, isGlobal?: boolean) => {
                            const modificator = FormBuffer.getModificator<M>(modificatorName);
                            const modificatorOptions = options.preset[key][modificatorName] as TypedModificatorOptions<M>;

                            if (!modificator || !modificator.inFormater || !modificatorOptions) return skipSymbol;
                            if (isGlobal && !modificator.canBeGlobal) throw new Error(`[FormBuffer] modificator ${modificatorName} cannot be global`);

                            return modificator.inFormater(oldValue, value, modificatorOptions, this, formBufferSymbols);
                        };

                        for (const modificatorName in options.preset[key]) {
                            const resultFromModificator = getResultFromModificator(modificatorName);
                            if (resultFromModificator === skipSymbol) continue;
                            else {
                                value = resultFromModificator;
                                break;
                            }
                        }
                        for (const modificatorName in options.global) {
                            const resultFromModificator = getResultFromModificator(modificatorName, true);
                            if (resultFromModificator === skipSymbol) continue;
                            else {
                                value = resultFromModificator;
                                break;
                            }
                        }
                    }
                } else value = this.clearProperty(key);

                (this as any)[key] = value;
            }

        } else this.clear();
    }

    getFormData() {

    }

    clear() {

    }

    clearProperty(key: keyof P): ValueOfPreset<P> {
        let value: ValueOfPreset<P>;

    }
}

export type FormBufferExtended<P = any, M extends Modificators = Modificators> = FormBuffer<P, M> & P;

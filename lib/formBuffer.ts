import { Modificators, FormBufferOptions, FormBufferInsideOptions, ValueOfPreset, TypedModificatorOptions, IModificator } from './types';

import formBufferSymbols, { optionsSymbol, skipSymbol, delSymbol } from './symbols';

interface ModifAndOptions<M extends Modificators = Modificators> {
    modificator: IModificator<M>;
    options: TypedModificatorOptions<M>;
}

function fixOptions<P, M extends Modificators>(options: FormBufferOptions<P, M>): FormBufferInsideOptions<P, M> {
    if (!options.defaultFormaters) options.defaultFormaters = {};
    if (!options.global) options.global = {};
    if (!options.inFormaters) options.inFormaters = {};
    if (!options.outFormaters) options.outFormaters = {};

    return options as FormBufferInsideOptions<P, M>;
}

const modificators: Map<string, IModificator<any, any>> = new Map();

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

    static get modificators() {
        return modificators;
    }

    static addModificator<M extends Modificators = Modificators>(modificator: IModificator<M>) {
        modificators.set(modificator.name, modificator);
    }

    static delModificator(modificatorName: string): boolean {
        return modificators.delete(modificatorName);
    }

    static getModificator<M extends Modificators = Modificators>(modificatorName: string): IModificator<M> | undefined {
        return modificators.get(modificatorName);
    }

    setValues(data: any) {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            const options = this[optionsSymbol];

            for (const key in options.preset) {
                if (key in FormBuffer.prototype) throw new Error(`[FormBuffer] Property name cannot have "${key}" value because it reserved`);

                let value = data[key];
                const oldValue = (this as any)[key];

                if (key in data) {
                    const formater = options.inFormaters[key];
                    let formaterResult: any;
                    if (formater) {
                        formaterResult = formater(oldValue, value, this, formBufferSymbols);
                        if (formaterResult !== skipSymbol) value = formaterResult;
                    }
                    if (!formater || formaterResult === skipSymbol) {
                        const modificatorsAndOptions = this._getModificatorsForProp(key);

                        for (const { modificator, options } of modificatorsAndOptions.values()) {
                            if (!modificator.inFormater) continue;

                            const resultFromModificator = modificator.inFormater(oldValue, value, options, this, formBufferSymbols);
                            if (resultFromModificator === skipSymbol) continue;

                            value = resultFromModificator;
                            break;
                        }
                    }
                } else value = this.clearProperty(key);

                (this as any)[key] = value;
            }

        } else this.clear();
    }

    getFormData(): P {
        const options = this[optionsSymbol];
        const result = {};

        for (const key in options.preset) {
            let value = (this as any)[key];

            const formater = options.outFormaters[key];
            let formaterResult: any;
            if (formater) {
                formaterResult = formater(value, this, formBufferSymbols);
                if (formaterResult !== skipSymbol) value = formaterResult;
            }
            if (!formater || formaterResult === skipSymbol) {
                const modificatorsAndOptions = this._getModificatorsForProp(key);

                for (const { modificator, options } of modificatorsAndOptions.values()) {
                    if (!modificator.outFormater) continue;

                    const resultFromModificator = modificator.outFormater(value, options, this, formBufferSymbols);
                    if (resultFromModificator === skipSymbol) continue;

                    value = resultFromModificator;
                    break;
                }
            }

            if (value !== delSymbol) (result as P)[key] = value;
        }

        return result as P;
    }

    private _getModificatorsForProp(propKey: Extract<keyof P, string>): Map<string, ModifAndOptions<M>> {
        const result = new Map<string, ModifAndOptions<M>>();
        const options = this[optionsSymbol];

        const globalModificators = Object.keys(options.global).map(name => ({ name, isGlobal: true }));
        const propModificators = Object.keys(options.preset[propKey]).map(name => ({ name, isGlobal: false }));

        [...propModificators, ...globalModificators].forEach(({ name, isGlobal }) => {
            if (result.has(name)) return;
            const modificator = FormBuffer.getModificator<M>(name);
            if (!modificator) throw new Error(`[FormBuffer] Modificator with name "${name}" does not exist`);

            const modifOptions = isGlobal ? options.global[name] : options.preset[propKey][name];

            result.set(name, { modificator, options: modifOptions as TypedModificatorOptions<M> });
        });

        return result;
    }

    clear() {
        for (const key in this[optionsSymbol].preset) {
            (this as any)[key] = this.clearProperty(key);
        }
    }

    clearProperty(key: Extract<keyof P, string>): ValueOfPreset<P> {
        const options = this[optionsSymbol];

        let value: any = undefined;
        const oldValue = (this as any)[key];

        const defaultFormater = options.defaultFormaters[key];
        let formaterResult: any;
        if (defaultFormater) {
            formaterResult = defaultFormater(oldValue, this, formBufferSymbols);
            if (formaterResult !== skipSymbol) value = formaterResult;
        }
        if (!defaultFormater || formaterResult === skipSymbol) {
            const modificatorsAndOptions = this._getModificatorsForProp(key);

            for (const { modificator, options } of modificatorsAndOptions.values()) {
                if (!modificator.defaultFormater) continue;

                const resultFromModificator = modificator.defaultFormater(oldValue, options, this, formBufferSymbols);
                if (resultFromModificator === skipSymbol) continue;

                value = resultFromModificator;
                break;
            }
        }

        if (value === undefined) throw new Error(`[FormBuffer] prop "${key}" haven't default value`);

        return value;
    }
}

export type FormBufferExtended<P = any, M extends Modificators = Modificators> = FormBuffer<P, M> & P;

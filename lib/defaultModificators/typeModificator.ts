import { SymbolsType } from './../symbols';
import { FormBufferOptions } from './../types';
import { IModificator, Modificators } from './../types/modificators';

import FormBuffer, { FormBufferExtended } from './../formBuffer';

export type TypeModificatorLowOptions =
    NumberConstructor |
    StringConstructor |
    ArrayConstructor |
    ObjectConstructor |
    BooleanConstructor;

export type TypeModificatorBigOptions = {
    type: TypeModificatorLowOptions | typeof FormBuffer;
    options?: FormBufferOptions;
};

export type TypeModificatorOptions = TypeModificatorLowOptions | TypeModificatorBigOptions;

export type TypeModificatorDefaultTypeFunction =
    (value: any, options?: FormBufferOptions) => any;

export type TypeModificatorInTypeFunction =
    (oldValue: any, newValue: any, options?: FormBufferOptions) => any;

export type TypeModificatorOutTypeFunction =
    (value: any, options?: FormBufferOptions) => any;

export interface TypeModificatorTypeObject {
    type: any;
    defaultFormater: TypeModificatorDefaultTypeFunction;
    inFormater?: TypeModificatorInTypeFunction;
    outFormater?: TypeModificatorOutTypeFunction;
}

export const defaultTypes: TypeModificatorTypeObject[] = [
    {
        type: String,
        defaultFormater: () => '',
    },
    {
        type: Number,
        defaultFormater: () => 0,
    },
    {
        type: Boolean,
        defaultFormater: () => false,
    },
    {
        type: Object,
        defaultFormater: () => ({}),
    },
    {
        type: Array,
        defaultFormater: () => [],
    },
    {
        type: FormBuffer,
        defaultFormater: (value, options) => {
            if (value instanceof FormBuffer) {
                value.clear();
                return value;
            }
            if (options) {
                return new FormBuffer(options);
            }
            throw new Error('[TypeModificator] FormBuffer haven\'t config');
        },
        inFormater: (oldValue, newValue, options) => {
            let nowFormBuffer = oldValue as FormBuffer;
            if (!nowFormBuffer) {
                if (options) nowFormBuffer = new FormBuffer(options);
                else throw new Error('[TypeModificator] FormBuffer haven\'t config');
            }
            nowFormBuffer.setValues(newValue);

            return nowFormBuffer;
        },
        outFormater: (value, options) => {
            if (value instanceof FormBuffer) return value.getFormData();
            throw new Error('[TypeModificator] Value is not FormBuffer');
        },
    },
];

export class TypeModificator<M extends Modificators = Modificators> implements IModificator<Modificators> {
    name: 'type';
    canBeGlobal: false;
    types: Map<any, TypeModificatorTypeObject>;

    constructor(types?: TypeModificatorTypeObject[]) {
        this.name = 'type';
        this.canBeGlobal = false;

        let nowTypes = types;

        if (!nowTypes) {
            nowTypes = defaultTypes;
        }

        const map = new Map<any, TypeModificatorTypeObject>();

        this.types = map;

        nowTypes.forEach((typeObject) => {
            this.addType(typeObject);
        });
    }

    addType(typeObject: TypeModificatorTypeObject) {
        const { type } = typeObject;

        if (this.types.has(type)) throw new Error(`[TypeModificator] type "${type}" already exist`);
        this.types.set(type, typeObject);
    }

    getType(type: any) {
        return this.types.get(type);
    }

    removeType(type: any) {
        return this.types.delete(type);
    }

    parseOptions(options: TypeModificatorOptions): TypeModificatorBigOptions {
        if (!options) throw new Error('[TypeModificator] type not supported');

        const types = [];
        for (const type of this.types.keys()) {
            types.push(type);
        }

        const isLowOptions = types.includes(options);
        if (isLowOptions) return { type: options as TypeModificatorLowOptions };

        const isBigOptions = (options as TypeModificatorBigOptions).type &&
            types.includes((options as TypeModificatorBigOptions).type);

        if (isBigOptions) return options as TypeModificatorBigOptions;

        throw new Error('[TypeModificator] type not supported');
    }

    defaultFormater(value: any, options: TypeModificatorOptions, formBuffer: FormBuffer<any, M> | FormBufferExtended<any, M>, symbols: SymbolsType) {
        const parsedOptions = this.parseOptions(options);

        const type = this.getType(parsedOptions.type);

        if (!type) throw new Error(`[TypeModificator] can't find type "${parsedOptions.type}"`);
        if (!type.defaultFormater) throw new Error(`[TypeModificator] can't find defaultFormater for "${parsedOptions.type}" type`);

        return type.defaultFormater(value, parsedOptions.options);
    }

    inFormater(
            oldValue: any,
            newValue: any,
            options: TypeModificatorOptions,
            formBuffer: FormBuffer<any, M> | FormBufferExtended<any, M>,
            symbols: SymbolsType,
    ) {
        const parsedOptions = this.parseOptions(options);

        const type = this.getType(parsedOptions.type);

        if (!type) throw new Error(`[TypeModificator] can't find type "${parsedOptions.type}"`);
        if (!type.inFormater) return symbols.skipSymbol;

        return type.inFormater(oldValue, newValue, parsedOptions.options);
    }

    outFormater(value: any, options: TypeModificatorOptions, formBuffer: FormBuffer<any, M> | FormBufferExtended<any, M>, symbols: SymbolsType) {
        const parsedOptions = this.parseOptions(options);

        const type = this.getType(parsedOptions.type);

        if (!type) throw new Error(`[TypeModificator] can't find type "${parsedOptions.type}"`);
        if (!type.outFormater) return symbols.skipSymbol;

        return type.outFormater(value, parsedOptions.options);
    }
}

export default new TypeModificator();

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

export type TypeModificatorTypeFunction =
    (value: any, options?: FormBufferOptions) => any;

export interface TypeModificatorTypeObject {
    type: any;
    formater: TypeModificatorTypeFunction;
}

export const defaultTypes: TypeModificatorTypeObject[] = [
    {
        type: String,
        formater: () => '',
    },
    {
        type: Number,
        formater: () => 0,
    },
    {
        type: Boolean,
        formater: () => false,
    },
    {
        type: Object,
        formater: () => ({}),
    },
    {
        type: Array,
        formater: () => [],
    },
    {
        type: FormBuffer,
        formater: (value, options) => {
            if (value && value.clear) {
                value.clear();
                return value;
            }
            if (options) {
                return new FormBuffer(options);
            }
            throw new Error('[TypeModificator] FormBuffer haven\'t config');
        },
    },
];

export class TypeModificator<M extends Modificators = Modificators> implements IModificator<Modificators> {
    name: 'type';
    canBeGlobal: false;
    formaters: Map<any, TypeModificatorTypeFunction>;

    constructor(types?: TypeModificatorTypeObject[]) {
        this.name = 'type';
        this.canBeGlobal = false;

        let nowTypes = types;

        if (!nowTypes) {
            nowTypes = defaultTypes;
        }

        const map = new Map<any, TypeModificatorTypeFunction>();

        this.formaters = map;

        nowTypes.forEach(({ type, formater }) => {
            this.addType({ type, formater });
        });
    }

    addType(typeObject: TypeModificatorTypeObject) {
        const { type, formater } = typeObject;

        if (this.formaters.has(type)) throw new Error(`[TypeModificator] type "${type}" already exist`);
        this.formaters.set(type, formater);
    }

    getTypeFormater(type: any) {
        return this.formaters.get(type);
    }

    removeType(type: any) {
        this.formaters.delete(type);
    }

    defaultFormater(value: any, options: TypeModificatorOptions, formBuffer: FormBuffer<M> | FormBufferExtended<M>) {
        if (!options) throw new Error('[TypeModificator] type not supported');

        const types = [];
        for (const type of this.formaters.keys()) {
            types.push(type);
        }

        const isLowOptions = types.includes(options);

        if (isLowOptions) {
            const lowOptions = options as TypeModificatorLowOptions;
            const formater = this.getTypeFormater(lowOptions);

            if (!formater) throw new Error(`[TypeModificator] can't find formater for "${lowOptions}" type`);

            return formater(value);
        }
        const isBigOptions = (options as TypeModificatorBigOptions).type &&
            types.includes((options as TypeModificatorBigOptions).type);

        if (isBigOptions) {
            const bigOptions = options as TypeModificatorBigOptions;
            const formater = this.getTypeFormater(bigOptions.type);

            if (!formater) throw new Error(`[TypeModificator] can't find formater for "${bigOptions.type}" type`);

            return formater(value, bigOptions.options);
        }

        throw new Error('[TypeModificator] type not supported');
    }
}

export default new TypeModificator();

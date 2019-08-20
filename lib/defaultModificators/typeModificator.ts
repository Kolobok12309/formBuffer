import { TypeModificatorLowOptions, TypeModificatorBigOptions, FormBufferOptions } from './../types';
import { ModificatorBuilder } from './../modificators';

import FormBuffer from './../index';

const builder = new ModificatorBuilder('type', false);

type mergedOptions = TypeModificatorLowOptions | typeof FormBuffer;

const types: mergedOptions[] = [Number, String, Array, Object, Boolean, FormBuffer];

function defaultByType(value: any, type: mergedOptions, options?: FormBufferOptions) {
    switch (type) {
    case String:
    default: return '';
    case Number: return 0;
    case Boolean: return false;
    case Object: return {};
    case Array: return [];
    case FormBuffer:
        if (value && value.clear && value.getFormData) {
            value.clear();
            return value.getFormData();
        }
        if (options) {
            return new FormBuffer(options);
        }
        throw new Error('[TypeModificator] FormBuffer haven\'t config');
    }
}

builder.addDefaultFormater((value, options, formBuffer) => {
    if (!options) throw new Error('[TypeModificator] type not supported');
    const isLowOptions = types.includes(options as mergedOptions);

    if (isLowOptions) {
        const lowOptions = options as TypeModificatorLowOptions;
        return defaultByType(value, lowOptions);
    }
    const bigOptions = options as TypeModificatorBigOptions;
    if (bigOptions.type) {
        const isTypeSupported = types.includes(bigOptions.type);
        if (!isTypeSupported) throw new Error('[TypeModificator] type not supported');

        return defaultByType(value, bigOptions.type, bigOptions.options);
    }
    throw new Error('[TypeModificator] type not supported');
});

export default builder.build();

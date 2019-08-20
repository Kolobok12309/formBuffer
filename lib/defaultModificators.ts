import { ModificatorBuilder } from './modificators';
import { IModificator, ModificatorsNames, inFormater, TypeModificatorOptions } from './types';
import FormBuffer from './index';

const deepBuilder = new ModificatorBuilder('deep', true);

function copy<T>(obj: T) {
    const jsoned = JSON.stringify(obj);
    return JSON.parse(jsoned) as T;
}

export const deepModificator = deepBuilder.addInFormater((oldValue, newValue, options) => {
    if (options) {
        return copy(newValue);
    }
    return null;
}).addOutFormater((value, options) => {
    if (options) {
        return copy(value);
    }
    return null;
}).build();

const autocleanBuilder = new ModificatorBuilder('autoclean', true);

export const autocleanModificator = autocleanBuilder.addOutFormater((value, options) => {
    if (options && value) return value;
    return null;
}).build();

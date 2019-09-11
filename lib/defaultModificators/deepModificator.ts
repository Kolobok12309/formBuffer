import { ModificatorBuilder } from './../modificators';

export type DeepModificatorOptions = boolean;

const builder = new ModificatorBuilder('deep', true);

const copyFunction = (value: any) => {
    const type = typeof value;
    if (type !== 'object' || value === null) {
        throw new Error('[DeepModificator] value would be a valid json object/array');
    }
    const jsoned = JSON.stringify(value);
    return JSON.parse(jsoned);
};

builder.addInFormater((oldValue, newValue, options, formBuffer, { skipSymbol }) => {
    if (options) {
        return copyFunction(newValue);
    }

    return skipSymbol;
}).addOutFormater((value, options, formBuffer, { skipSymbol }) => {
    if (options) {
        return copyFunction(value);
    }

    return skipSymbol;
});

export default builder.build();

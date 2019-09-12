import { ModificatorBuilder } from './../modificators';

export type DefaultModificatorOptions = any | (() => any);

const builder = new ModificatorBuilder('default');

builder.addDefaultFormater((value, options, formBuffer) => {
    if (typeof options === 'function') return options();
    return options;
});

export const defaultModificator = builder.build();

export default defaultModificator;

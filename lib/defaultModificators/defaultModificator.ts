import { ModificatorBuilder } from './../modificators';

export type DefaultModificatorOptions = any | (() => any);

const builder = new ModificatorBuilder('default', false);

builder.addDefaultFormater((value, options, formBuffer) => {
    if (typeof options === 'function') return options();
    return options;
});

export default builder.build();

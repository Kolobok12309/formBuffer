import { ModificatorBuilder } from './../modificators';

const builder = new ModificatorBuilder('default', false);

builder.addDefaultFormater((value, options, formBuffer) => {
    if (typeof options === 'function') return options();
    return options;
});

export default builder.build();

import { ModificatorBuilder } from './../modificators';

export type AutocleanModificatorOptions = boolean;

const builder = new ModificatorBuilder('autoclean', true);

builder.addOutFormater((value, options, formBuffer, { delSymbol }) => {
    if (options && value) return value;

    return delSymbol;
});

export default builder.build();

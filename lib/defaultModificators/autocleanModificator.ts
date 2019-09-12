import { ModificatorBuilder } from './../modificators';

export type AutocleanModificatorOptions = boolean;

const builder = new ModificatorBuilder('autoclean');

builder.addOutFormater((value, options, formBuffer, { delSymbol }) => {
    if (options && value) return value;

    return delSymbol;
});

export const autocleanModificator = builder.build();

export default autocleanModificator;

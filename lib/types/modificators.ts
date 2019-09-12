import { KnownKeys } from './index';

import { TypeModificatorOptions } from '../defaultModificators/typeModificator';
import { DeepModificatorOptions } from '../defaultModificators/deepModificator';
import { AutocleanModificatorOptions } from '../defaultModificators/autocleanModificator';
import { DefaultModificatorOptions } from '../defaultModificators/defaultModificator';

import { ModificatorDefaultFormater, ModificatorInFormater, ModificatorOutFormater } from './formaters';

interface ModificatorsSchema {
    [k: string]: any;
}

export interface Modificators extends ModificatorsSchema {
    deep: DeepModificatorOptions;
    autoclean: AutocleanModificatorOptions;
    type: TypeModificatorOptions;
    default: DefaultModificatorOptions;
}

export type PartialModificators<M extends Modificators = Modificators> = Partial<M>;

export type ModificatorsNames<M extends Modificators | unknown> =
    M extends Modificators ? KnownKeys<M> : KnownKeys<Modificators>;

export interface IModificator<M extends Modificators, N extends ModificatorsNames<M> | unknown = unknown> {
    name: N extends ModificatorsNames<M> ? N : ModificatorsNames<M>;

    inFormater?: ModificatorInFormater<M, N>;
    outFormater?: ModificatorOutFormater<M, N>;
    defaultFormater?: ModificatorDefaultFormater<M, N>;
}

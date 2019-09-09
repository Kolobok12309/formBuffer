import { KnownKeys } from './index';

import { TypeModificatorOptions } from '../defaultModificators/typeModificator';
import { DeepModificatorOptions } from '../defaultModificators/deepModificator';

import { ModificatorDefaultFormater, ModificatorInFormater, ModificatorOutFormater } from './formaters';

interface ModificatorsSchema {
    [k: string]: any;
}

export interface Modificators extends ModificatorsSchema {
    deep: DeepModificatorOptions;
    autoclean: boolean;
    type: TypeModificatorOptions;
    default: any | (() => any);
}

export type PartialModificators<M extends Modificators = Modificators> = Partial<M>;

export type ModificatorsNames<M extends Modificators | unknown> =
    M extends Modificators ? KnownKeys<M> : KnownKeys<Modificators>;

export interface IModificator<M extends Modificators, N extends ModificatorsNames<M> | unknown = unknown> {
    name: N extends ModificatorsNames<M> ? N : ModificatorsNames<M>;
    canBeGlobal: boolean;

    inFormater?: ModificatorInFormater<M, N>;
    outFormater?: ModificatorOutFormater<M, N>;
    defaultFormater?: ModificatorDefaultFormater<M, N>;
}

import { SymbolsType } from './../symbols';
import { Modificators, ModificatorsNames } from './index';
import FormBuffer, { FormBufferExtended } from '../formBuffer';

type allOptions<M extends Modificators> = {
    [K in ModificatorsNames<M>]: M[K]
} extends { [_ in ModificatorsNames<M>]: infer U } ? U : never;

export type TypedModificatorOptions<M extends Modificators = Modificators, N extends ModificatorsNames<M> | unknown = unknown> =
    N extends ModificatorsNames<M> ? M[N] : allOptions<M>;

export type ValueOfPreset<P> = P[Extract<keyof P, string>];

export type ModificatorInFormater<
    M extends Modificators = Modificators,
    N extends ModificatorsNames<M> | unknown = unknown,
> =
    (
        oldValue: any,
        newValue: any,
        options: TypedModificatorOptions<M, N>,
        formBuffer: FormBuffer<any, M> | FormBufferExtended<any, M>,
        symbols: SymbolsType,
    ) => any;

export type ModificatorOutFormater<
    M extends Modificators = Modificators,
    N extends ModificatorsNames<M> | unknown = unknown
> =
    (
        value: any,
        options: TypedModificatorOptions<M, N>,
        formBuffer: FormBuffer<any, M> | FormBufferExtended<any, M>,
        symbols: SymbolsType,
    ) => any;

export type ModificatorDefaultFormater<M extends Modificators = Modificators, N extends ModificatorsNames<M> | unknown = unknown> =
    (
        value: any,
        options: TypedModificatorOptions<M, N>,
        formBuffer: FormBuffer<any, M> | FormBufferExtended<any, M>,
        symbols: SymbolsType,
    ) => any;

export type inFormater<T, M extends Modificators = Modificators> = (
    oldValue: T,
    newValue: T,
    formBuffer: FormBuffer<any, M> | FormBufferExtended<any, M>,
    symbols: SymbolsType,
) => T;

export type outFormater<T, M extends Modificators = Modificators> = (
        value: T,
        formBuffer: FormBuffer<any, M> | FormBufferExtended<any, M>,
        symbols: SymbolsType,
    ) => T;

export type defaultFormater<T, M extends Modificators = Modificators> = (
        oldValue: T,
        formBuffer: FormBuffer<any, M> | FormBufferExtended<any, M>,
        symbols: SymbolsType,
    ) => T;

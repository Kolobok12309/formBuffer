export * from './modificators';
export * from './formaters';

import { Modificators, PartialModificators } from './modificators';
import { inFormater, outFormater, defaultFormater } from './formaters';

export type KnownKeys<T> = {
    [K in keyof T]: (string extends K ? never : (number extends K ? never : K))
} extends { [_ in keyof T]: infer U } ? U : never;

export interface FormBufferOptions<P = any, M extends Modificators = Modificators> {
    preset: {
        [K in keyof P]: PartialModificators<M>;
    };
    config?: PartialModificators<M>;
    inFormaters?: {
        [K in keyof P]?: inFormater<P[K], M>;
    };
    outFormaters?: {
        [K in keyof P]?: outFormater<P[K], M>;
    };
    defaultFormater?: {
        [K in keyof P]?: defaultFormater<P[K], M>;
    };
}

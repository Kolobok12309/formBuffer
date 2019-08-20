import { Modificators, FormBufferOptions } from './types';
import { ModificatorBuilder } from './modificators';

export { ModificatorBuilder };

export default class FormBuffer<P = any, M extends Modificators = Modificators> {
    constructor(options: FormBufferOptions<P, M>) {

    }
}

export type FormBufferExtended<P = any, M extends Modificators = Modificators> = FormBuffer<P, M>;


import { Modificators, FormBufferOptions } from './types';

export default class FormBuffer<P = any, M extends Modificators = Modificators> {
    constructor(options: FormBufferOptions<P, M>) {

    }

    clear() {

    }
}

export type FormBufferExtended<P = any, M extends Modificators = Modificators> = FormBuffer<P, M>;

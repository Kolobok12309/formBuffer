import { Modificators, IModificator, ModificatorsNames, ModificatorInFormater, ModificatorOutFormater, ModificatorDefaultFormater } from './types';

export class ModificatorBuilder<M extends Modificators = Modificators, N extends ModificatorsNames<M> | unknown = unknown> {
    name: N extends ModificatorsNames<M> ? N : ModificatorsNames<M>;

    inFormater?: ModificatorInFormater<M, N>;
    outFormater?: ModificatorOutFormater<M, N>;
    defaultFormater?: ModificatorDefaultFormater<M, N>;

    constructor(name: N extends ModificatorsNames<M> ? N : ModificatorsNames<M>) {
        this.name = name;
    }

    addInFormater(formater: ModificatorInFormater<M, N>) {
        this.inFormater = formater;
        return this;
    }

    addOutFormater(formater: ModificatorOutFormater<M, N>) {
        this.outFormater = formater;
        return this;
    }

    addDefaultFormater(formater: ModificatorDefaultFormater<M, N>) {
        this.defaultFormater = formater;
        return this;
    }

    build() {
        return {
            ...this,
        } as IModificator<M, N>;
    }
}

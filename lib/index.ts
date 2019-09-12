import { ModificatorBuilder } from './modificators';
import FormBuffer, { FormBufferExtended } from './formBuffer';

export * from './types';
export * from './defaultModificators';
export * from './symbols';

import defaultModificator from './defaultModificators/defaultModificator';
import deepModificator from './defaultModificators/deepModificator';
import autocleanModificator from './defaultModificators/autocleanModificator';
import typeModificator from './defaultModificators/typeModificator';

const defaultModificators = [
    defaultModificator,
    deepModificator,
    autocleanModificator,
    typeModificator,
];

defaultModificators.forEach((modificator) => {
    FormBuffer.addModificator(modificator);
});

export { ModificatorBuilder, FormBufferExtended };

export default FormBuffer;

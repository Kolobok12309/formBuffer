export const skipSymbol = Symbol('[FormBuffer] Modificator skip symbol');
export const delSymbol = Symbol('[FormBuffer] Modificator del prop symbol');
export const optionsSymbol = Symbol('[FormBuffer] Symbol for access to FormBuffer options');

export type SymbolsType = {
    skipSymbol: Symbol;
    delSymbol: Symbol;
    optionsSymbol: Symbol;
};

export default {
    skipSymbol,
    delSymbol,
    optionsSymbol,
};
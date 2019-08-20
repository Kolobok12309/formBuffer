/* tslint:disable */
class defaultBuffer {
    constructor() {
        // Инициализация пресета
        this._preset = {};
        // Список форматировщиков для входящих данных
        this._inFormaters = {};
        // Список форматировщиков для исходящих данных
        this._outFormaters = {};
        // Список дополнительных форматировщиков входящих данных
        this._additionalInFormaters = {};
        // Список дополнителньых форматировщиков исходящих данных
        this._additionalOutFormaters = {};
        // Конфиг
        this._config = {};
        // Сокрытие служебных свойств
        this._hideProps();
    }

    static get reservedNames() {
        return ['_hideProps', '_preset', '_inFormaters', '_outFormaters', '_additionalInFormaters', '_additionalOutFormaters', '_config', 'data', 'formData', 'clear', '_clearProperty', 'setValues', 'constructor', '_checkName', 'allData', '_getAllPropsWithData', 'deepCopy'];
    }

    // Получение списка ключей из пресета
    get _keys() {
        return Object.keys(this._preset);
    }

    // Получение отформатированного буфера
    get formData() {
        // Создание нового объекта для результата
        const result = {};
        // Проход по свойствам из пресета
        this._keys.forEach((key) => {
            // Проверка есть ли форматировщик исходящий
            if (this._outFormaters[key]) {
                const fromFormater = this._outFormaters[key](this[key], this);
                if (fromFormater !== null) {
                    result[key] = fromFormater;
                }
                // Проверка на аттрибут autoclean
            } else if (this._preset[key].autoclean) {
                if (this[key]) result[key] = this[key];
                // Проверка на глубокое копирование свойства
            } else if (this[key] !== undefined && (this._preset[key].deep || this._config.deep)) {
                result[key] = JSON.parse(JSON.stringify(this[key]));
                // Если тегов нет, то вернуть значение которое заполнено
            } else if (this[key] !== undefined) {
                result[key] = this[key];
                // Иначе заполнение дефолтом
            } else {
                result[key] = this._clearProperty(key);
            }
        });
        // Проход по дополнительным форматировщиков исходящих данных
        Object.keys(this._additionalOutFormaters).forEach((key) => {
            if (result[key] !== undefined) throw new Error(`[My-Buffer] Property "${key}" in "additionalOutFormaters" reassign normal property`);

            result[key] = this._additionalOutFormaters[key](this);
        });
        return result;
    }

    // Получение неформатированного буфера со свойствами из пресета
    get data() {
        const result = {};
        this._keys.forEach((key) => {
            result[key] = this[key];
        });
        return result;
    }

    // Получение неформатированного буфера
    get allData() {
        const result = {};
        Object.keys(this).forEach((key) => {
            if (!~defaultBuffer.reservedNames.indexOf(key)) {
                result[key] = this[key];
            }
        });
        return result;
    }

    // Получение полной-глубокой копии неформатированного буфера
    get deepCopy() {
        const jsonString = JSON.stringify(this.allData);
        return JSON.parse(jsonString);
    }

    // Очистка буфера и приведение к дефолтным значениям
    clear() {
        const allKeys = this._keys.concat(Object.keys(this));
        allKeys.forEach((key) => {
            if (!~defaultBuffer.reservedNames.indexOf(key)) {
                if (~this._keys.indexOf(key)) {
                    this[key] = this._clearProperty(key);
                } else {
                    delete this[key];
                }
            }
        });
    }

    // Очистка конкретного свойства
    _clearProperty(key) {
        const type = this._preset[key].type;
        const defaultVal = this._preset[key].default;
        let value;
        if (defaultVal !== undefined) {
            if (type === Object || type === Array) {
                value = defaultVal();
            } else value = defaultVal;
        } else {
            switch (type) {
            default:
            case Number:
            case String:
                value = '';
                break;

            case Object:
                value = {};
                break;

            case Array:
                value = [];
                break;

            case Boolean:
                value = false;
                break;
            }
        }
        return value;
    }

    // Проверка на название специфичных свойств
    _checkName(key) {
        defaultBuffer.reservedNames.forEach((reservedKey) => {
            if (key === reservedKey) throw new Error(`[My-Buffer] property name cannot have "${key}" reserved name`);
        });
    }


    // Получение списка всех свойств суммарно из пресета и добавленных отдельно
    _getAllPropsWithData(data) {
        const result = {};
        Object.keys(data).forEach(key => (result[key] = true));
        this._keys.forEach(key => (result[key] = true));
        return Object.keys(result);
    }

    // Функция для заполнения буфера
    setValues(data) {
        if (data && typeof data === 'object') {
            const dataKeys = Object.keys(data);
            const allProps = this._getAllPropsWithData(data);
            allProps.forEach((key) => {
                const isInKeys = ~this._keys.indexOf(key);
                const isInData = ~dataKeys.indexOf(key);
                this._checkName(key);
                let value = data[key];
                if (isInKeys) {
                    if (this._inFormaters[key]) {
                        try {
                            value = this._inFormaters[key](value, this, data);
                        } catch (err) {
                            console.error(err);
                        }
                    } else if (value === undefined) {
                        if (this._preset[key].default !== undefined) {
                            value = this._clearProperty(key);
                        } else {
                            value = '';
                        }
                    } else if (this._preset[key].deep || this._config.deep) {
                        const jsonString = JSON.stringify(value);
                        value = JSON.parse(jsonString);
                    }
                    this[key] = value;
                } else if (isInData) {
                    this[key] = data[key];
                }
            });
            Object.keys(this._additionalInFormaters).forEach((key) => {
                const isInKeys = ~this._keys.indexOf(key);
                if (isInKeys && this[key] !== undefined) throw new Error(`[My-Buffer] Property "${key}" in "additionalInFormaters" reassign normal property`);

                this[key] = this._additionalInFormaters[key](this);
            });
        } else this.clear();
    }

    // Функция для сокрытие свойств доступных в данный момент
    _hideProps() {
        Object.keys(this).forEach((key) => {
            Object.defineProperty(this, key, {
                enumerable: false,
            });
        });
    }
}

export default class Buffer extends defaultBuffer {
    constructor({
        preset, config = {}, inFormaters = {}, outFormaters = {}, additionalInFormaters = {}, additionalOutFormaters = {},
    },          data?: any) {
        // Вызов конструктора родителя
        super();
        // Проверка имен поступившего пресета
        Object.keys(preset).forEach(key => this._checkName(key));
        // Заполнение служебных свойств
        this._preset = Object.assign(this._preset, preset);
        this._config = Object.assign(this._config, config);
        this._inFormaters = Object.assign(this._inFormaters, inFormaters);
        this._outFormaters = Object.assign(this._outFormaters, outFormaters);
        this._additionalInFormaters = Object.assign(this._additionalInFormaters, additionalInFormaters);
        this._additionalOutFormaters = Object.assign(this._additionalOutFormaters, additionalOutFormaters);
        // Заполнение буфера данными если они есть
        this.setValues(data);
    }
}

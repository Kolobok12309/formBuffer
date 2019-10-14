# FormBuffer

## Description

FormBuffer is a class for working with form values, you can format values on entry in buffer (inFormaters), on output(outFormaters), and on clear(defaultFormaters).

If you are tired of it, or if this is not enough for you

```js
const data = (() => {
    name: '',
    phone: '',
    ...
})
```

## Typescript

It fully compatible with typescript, for using you only need call `FormBuffer.extend(...)`, not `new FormBuffer(...)`

## Installation

Using npm:

```
npm install --save form-buffer
```

```js
import FormBuffer from 'form-buffer';
```

Using cdn:

```html
<script src="https://unpkg.com/form-buffer"></script>
<script>
    const FormBufferClass = FormBuffer.default;
    console.log(FormBuffer);
    console.log(FormBufferClass);
</script>
```

## Example

```js
const options = {
    preset: {
        test: {
            type: String,
        },
        test2: {
            default: 123,
        },
        test3: {
            default: () => 123,
        },
    },
};

const buffer = new FormBuffer(options);
```

## Options

### preset

#### Schema

```js
{
    propName: {
        modif1: modif1Options,
        modif2: modif2Options,
    }
}
```

#### Description

Object which contain keys future props and used modificators

#### Required `true`

### global

#### Schema

```js
{
    modif1: modif1Options,
    modif2: modif2Options,
}
```

#### Description

Contain global modificators which spreading on all props(local modifs have more priority)

#### Required `false`

### inFormaters

#### Schema

```js
{
    inFormaters: {
        propName(oldValue, newValue, formBuffer, symbols) {

        }
    }
}
```

#### Description

Contain inFormaters for props

#### Arguments

`oldValue` - previously value

`newValue` - prop value which transferred in setValues method

`formBuffer` - object of this FormBuffer

`symbols` - object with delSymbol and skipSymbol

#### Required `false`

### outFormaters

#### Schema

```js
{
    outFormaters: {
        propName(value, formBuffer, symbols) {

        }
    }
}
```

#### Description

Contain outFormaters(called when call getFormData) for props

#### Arguments

`value` - last value of prop

`formBuffer` - object of this FormBuffer

`symbols` - object with delSymbol and skipSymbol

#### Required `false`

### defaultFormaters

#### Schema

```js
{
    outFormaters: {
        propName(oldValue, formBuffer, symbols) {

        }
    }
}
```

#### Description

Contain defaultFormaters(called when call clear) for props

#### Arguments

`oldValue` - last value of prop

`formBuffer` - object of this FormBuffer

`symbols` - object with delSymbol and skipSymbol

#### Required `false`

## Modificators

### Description

Modificators - are objects which group formaters, modificator can have 1 or all 3 formaters, and modificators can pass parameters

### Default modificators

#### Autoclean modificator

Lightweight modificator which do only one thing, if value from formData not equal true(not strict euqal) delete prop with this value from result object

##### Example

```js
const config = {
    preset: {
        test1: {
            type: String,
            autoclean: true,
        },
        test2: {
            type: String,
        },
    },
};

const buffer = new FormBuffer(config);
buffer.test2 = 'foo';

const result = buffer.getFormData();
// result = {
//    test2: 'foo',
//}
```

#### Deep modificator

Modificator for copying object/array structures on `in` and `out`, now don\`t support symbols in props, only `JSON` stringify objects

##### Example

```js
const config = {
    preset: {
        test1: {
            type: Object,
            deep: true,
        },
        test2: {
            type: Object,
        },
    },
};

const buffer = new FormBuffer(config);
const testObj = {
    test1: {},
    test2: {},
};

buffer.setValues(testObj);

// buffer.test2 === testObj.test2
// buffer.test1 !== testObj.test1

const result = buffer.getFormData();

// result.test2 === testObj.test2
// result.test1 !== testObj.test1
```

#### Default modificator

Modificator for default value(when called clear), return everything, that pass in parameter, but if parameter function, call it without some arguments

##### Example

```js
const config = {
    preset: {
        test1: {
            default: () => 'foo',
        },
        test2: {
            default: 'bar',
        },
    },
};

const buffer = new FormBuffer(config);
// buffer = {
//    test1: 'foo',
//    test2: 'bar',
//    ...
//}

const result = buffer.getFormData();
// result = {
//    test1: 'foo',
//    test2: 'bar'
//}
```

#### Type modificator

Modificator for fast working with `defaultModificator` and using nested `FormBuffer`

You can custom this modificator by methods `{add/has/remove/get}Type`

##### Example

```js
const configNested = {
    preset: {
        foo: {
            type: String,
        },
    },
};

const config = {
    preset: {
        test1: {
            type: String,
        },
        test2: {
            type: {
                type: FormBuffer,
                options: configNested,
            },
        },
    },
};

const buffer = new FormBuffer(config);

// buffer.test1 === ''
// buffer.test2.foo === ''
```

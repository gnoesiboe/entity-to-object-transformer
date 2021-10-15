# Entity to Object transformer

Transforms entities to native objects and back using a mapping. Enables you to use domain entities in your application, but store them as plain objects, and re-hydrate them when they come back from the database.

## Features

* Support for custom transformers to transform and reverse transform complex property values like value objects
* Transforms nested entity relationship including child collections
* Typescript types included
* Well tested
* By default, it throws when you forget or wrongly map a property, to prevent you from making mistakes

## Example usage:

```tsx
import EntityToObjectTransformer, { ObjectMapping } from '@gnoesiboe/entity-to-object-transformer'

type AuthorAsObjectType = {
  _id: string;
  name: string;
  createdAt: string;
};

type BlogItemAsObject = {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  author: AuthorAsObjectType;
}

const author = new Author(new Uuid(), 'Peter Pan')
const blogItem = new BlogItem(new Uuid(), 'Some title', 'Some description', author);

const transformer = new EntityToObjectTransformer<BlogItem, BlogItemAsObject>();

const mapping: ObjectMapping = {
    type: 'object',
    constructor: BlogItem,
    properties: {
        uuid: {
            type: 'property',
            as: '_id',
            transformer: new UuidToStringTransformer(),
        },
        _title: {
            type: 'property',
            as: 'title',
        },
        _description: {
            type: 'property',
            as: 'description',
        },
        createdAt: {
            type: 'property',
            transformer: new DateToStringTransformer(),
        },
        author: {
            type: 'object',
            constructor: Author,
            properties: {
                uuid: {
                    type: 'property',
                    as: '_id',
                    transformer: new UuidToStringTransformer(),
                },
                _name: {
                    as: 'name',
                    type: 'property',
                },
                createdAt: {
                    type: 'property',
                    transformer: new DateToStringTransformer(),
                },
            },
        },
    }
}

const blogItemAsObject = transformer.transform(blogItem, mapping);

/*
OUTPUT:

{
    _id: 'ae1a0d1a-2f6b-40e5-90b6-5b3d2f00e83a',
    title: 'Some title',
    description: 'Some description',
    createdAt: '2021-10-14T06:28:37.021Z',
    author: {
        _id: '352cc994-12c0-4e07-b837-0b4e6c31711b',
        name: 'Peter Pan',
        createdAt: '2021-10-14T06:29:00.841Z',
    },
}

 */

const blogItemAsModelAgain = transformer.reverseTransform(blogItemAsObject, mapping);

// OUTPUT: Your entity, re-hydrated again
```

## Documentation

The `EntityToObjectTransformer` exposes two methods:

1. `transform` → transforms an entity into an object by plucking and transforming the instances properties according to the supplied mapping
2. `reverseTransform` → transforms an object into an entity by constructing it, and setting the properties on it, according to the supplied mapping

The mapping implements two types:

```ts
export type PropertyMapping = {
    type: 'property';
    as?: string;
    transformer?: PropValueTransformer;
};

export type ObjectMapping = {
    type: 'object';
    constructor: ClassConstructor;
    as?: string;
    properties: {
        [key: string]: PropertyMapping | ObjectMapping;
    };
    ignoredProperties?: string[];
};
```

Starting with an `ObjectType`, you can nest them together to form a mapping tree:

Example:
```ts
const mapping: ObjectMapping = {
    type: 'object',
    constructor: BlogItem,
    properties: {
        uuid: {
            type: 'property',
            as: '_id',
            transformer: new UuidToStringTransformer(),
        },
        _title: {
            type: 'property',
            as: 'title',
        },
        _description: {
            type: 'property',
            as: 'description',
        },
        createdAt: {
            type: 'property',
            transformer: new DateToStringTransformer(),
        },
        author: {
            type: 'object',
            constructor: Author,
            properties: {
                uuid: {
                    type: 'property',
                    as: '_id',
                    transformer: new UuidToStringTransformer(),
                },
                _name: {
                    as: 'name',
                    type: 'property',
                },
                createdAt: {
                    type: 'property',
                    transformer: new DateToStringTransformer(),
                },
            },
        },
    }
}

```

### `ObjectType`

Represents an instance transformed into an object or an array of instances transformed into an array of objects.

| key | type | description |
|:---|:----|:----|
| `type` | `"object"` | This should always be `"object"` and should be provided at all times to make distinction between `object`-types and `property`-types |
| `constructor` | `ClassConstructor` | A class constructor to use for reverse transforming objects into entity instances |
| `as` | <code>string &#124; undefined</code> | When defining a child entity in the mapping, this can be used to specify the name of the key on the parent object that it is transformed into |
| `properties` | <code>Record<string, PropertyMapping &#124; ObjectMapping></code> | An object containing as `key` the name of the property on the instance, and as value `ObjectType` or `PropertyType` mappings |
| `ignoredProperties` | `string[]` | By default the transformer will throw an Error when you forget to map properties, to prevent any mistakes. When you want a instance property not to be mapped, add the property key in this array.

### `PropertyType`

Represents a property transformed into something else (up to ypu), or an array of properties transformed.

| key | type | description |
|:---|:----|:----|
| `type` | `"property"` | This should always be `"property"` and should be provided at all times to make distinction between `object`-types and `property`-types
| `as` | <code>string &#124; undefined</code> | If you don't want the original property name to be outputted in the object, define an alternate name |
| `transformer` | `PropValueTransformer` | A class instance implementing `PropValueTransformer` interface that can be called during the transformations to change the property value into anything you want

## Known limitations and todos

* As constructors are instantiated without arguments, and the props are set on the instance, there might be problems with runtime validation in the constructor. 
* Support arrays that contain different types of instances
* Be able to use custom child collection classes and loop through them

import { checkArrayDiff } from '../utility/arrayComparisonUtilities';
import { isObjectMapping } from '../utility/mappingIdentifiers';
import PropertyNotFoundOnEntityError from '../error/PropertyNotFoundOnEntityError';
import PropertyNotFoundInObjectError from '../error/PropertyNotFoundInObjectError';
import PropertiesNotMappedError from '../error/PropertiesNotMappedError';
import CouldNotAssignPropertyValueError from '../error/CouldNotAssignPropertyValueError';

export type PropValueTransformer<FromType = any, ToType = any> = {
    transform(input: FromType): ToType;
    reverseTransform(input: ToType): FromType;
};

export type ClassConstructor = {
    new (...args: any[]): {};
    [key: string]: any;
};

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

export default class EntityToObjectTransformer<
    EntityType extends Record<string, any>,
    ObjectType = Record<string, any>,
> {
    constructor(private mapping: ObjectMapping) {}

    private forEachMappingProperty(
        callback: (
            propertyMappingKey: Extract<keyof ObjectMapping['properties'], string>,
            propertyMapping: PropertyMapping | ObjectMapping,
        ) => void,
    ): void {
        const propertyMappingKeys = Object.keys(this.mapping.properties) as Array<
            Extract<keyof ObjectMapping['properties'], string>
        >;

        propertyMappingKeys.forEach((propertyMappingKey) => {
            const propertyMapping = this.mapping.properties[propertyMappingKey];

            if (!propertyMapping) {
                throw new Error(
                    `Expecting property mapping for key '${propertyMappingKey}' to be available at this point`,
                );
            }

            callback(propertyMappingKey, propertyMapping);
        });
    }

    transform(entity: EntityType): ObjectType {
        const out: Record<string, any> = {};

        const allEntityProps: string[] = Object.keys(entity);
        const transformedEntityProps: string[] = [];

        this.forEachMappingProperty((propertyMappingKey, propertyMapping) => {
            const key = propertyMapping.as || propertyMappingKey;

            if (typeof entity[propertyMappingKey] === 'undefined') {
                throw PropertyNotFoundOnEntityError.createForProperty(key, this.mapping.constructor);
            }

            let value = entity[propertyMappingKey];

            if (isObjectMapping(propertyMapping)) {
                const childTransformer = new EntityToObjectTransformer(propertyMapping);

                value = Array.isArray(value)
                    ? value.map((item) => childTransformer.transform(item))
                    : childTransformer.transform(value);
            } else if (propertyMapping.transformer) {
                const customTransformer = propertyMapping.transformer;

                value = Array.isArray(value)
                    ? value.map((item) => customTransformer.transform(item))
                    : customTransformer.transform(value);
            }

            out[key] = value;

            transformedEntityProps.push(propertyMappingKey);
        });

        const forgottenProps = checkArrayDiff(allEntityProps, transformedEntityProps);
        this.throwIfNotAllPropertiesAreMapped(forgottenProps);

        return out as ObjectType;
    }

    reverseTransform(inputObject: Record<string, any>): EntityType {
        const instance = new this.mapping.constructor() as EntityType;

        this.forEachMappingProperty((propertyMappingKey, propertyMapping) => {
            const inputKey = propertyMapping.as || propertyMappingKey;

            let value = inputObject[inputKey];

            if (value === undefined) {
                throw PropertyNotFoundInObjectError.createForProperty(inputKey, inputObject);
            }

            if (isObjectMapping(propertyMapping)) {
                const childTransformer = new EntityToObjectTransformer(propertyMapping);

                value = Array.isArray(value)
                    ? value.map((item) => childTransformer.reverseTransform(item))
                    : childTransformer.reverseTransform(value);
            } else if (propertyMapping.transformer) {
                const transformer = propertyMapping.transformer;

                value = Array.isArray(value)
                    ? value.map((item) => transformer.reverseTransform(item))
                    : transformer.reverseTransform(value);
            }

            const success = Reflect.set(instance, propertyMappingKey, value);

            if (!success) {
                throw CouldNotAssignPropertyValueError.createForProperty(propertyMappingKey, this.mapping.constructor);
            }
        });

        return instance;
    }

    private throwIfNotAllPropertiesAreMapped(forgottenProps: string[]) {
        const ignoredProps = this.mapping.ignoredProperties || [];

        const propsToThrowFor = checkArrayDiff(forgottenProps, ignoredProps);

        if (propsToThrowFor.length > 0) {
            throw PropertiesNotMappedError.createForProperties(propsToThrowFor, this.mapping.constructor);
        }
    }
}

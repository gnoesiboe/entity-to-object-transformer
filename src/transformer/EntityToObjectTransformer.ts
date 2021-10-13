import { checkArrayDiff } from '../utility/arrayComparisonUtilities';
import { isObjectMapping } from '../utility/mappingIdentifiers';
import PropertyNotFoundOnEntityError from '../error/PropertyNotFoundOnEntityError';
import PropertyNotFoundInObjectError from '../error/PropertyNotFoundInObjectError';
import PropertiesNotMappedError from '../error/PropertiesNotMappedError';
import CouldNotAssignPropertyValueError from '../error/CouldNotAssignPropertyValueError';

export type PropValueTransformer<FromType = any, ToType = any> = {
    transform(from: FromType): ToType;
    reverseTransform(to: ToType): FromType;
};

export type ClassConstructor<EntityType = {}> = {
    new (...args: any[]): EntityType;
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
    properties: Partial<{
        [key: string]: PropertyMapping | ObjectMapping;
    }>;
    ignoredProperties?: string[];
};

export default class EntityToObjectTransformer<
    EntityType extends Record<string, any>,
    ObjectType = Record<string, any>,
> {
    private static forEachMappingProperty(
        mapping: ObjectMapping,
        callback: (
            propertyMappingKey: Extract<keyof ObjectMapping['properties'], string>,
            propertyMapping: PropertyMapping | ObjectMapping,
        ) => void,
    ): void {
        const propertyMappingKeys = Object.keys(mapping.properties) as Array<
            Extract<keyof ObjectMapping['properties'], string>
        >;

        propertyMappingKeys.forEach((propertyMappingKey) => {
            const propertyMapping = mapping.properties[propertyMappingKey];

            if (!propertyMapping) {
                throw new Error(
                    `Expecting property mapping for key '${propertyMappingKey}' to be available at this point`,
                );
            }

            callback(propertyMappingKey, propertyMapping);
        });
    }

    transform(entity: EntityType, mapping: ObjectMapping): ObjectType {
        const out: Record<string, any> = {};

        const allEntityProps: string[] = Object.keys(entity);
        const transformedEntityProps: string[] = [];

        EntityToObjectTransformer.forEachMappingProperty(mapping, (propertyMappingKey, propertyMapping) => {
            const key = propertyMapping.as || propertyMappingKey;

            let value = entity[propertyMappingKey];

            if (value === undefined) {
                throw PropertyNotFoundOnEntityError.createForProperty(key, mapping.constructor);
            }

            if (isObjectMapping(propertyMapping)) {
                value = Array.isArray(value)
                    ? value.map((item) => this.transform(item, propertyMapping))
                    : this.transform(value, propertyMapping);
            } else if (propertyMapping.transformer) {
                const { transform } = propertyMapping.transformer;

                value = Array.isArray(value) ? value.map((item) => transform(item)) : transform(value);
            }

            out[key] = value;

            transformedEntityProps.push(propertyMappingKey);
        });

        const forgottenProps = checkArrayDiff(allEntityProps, transformedEntityProps);
        const ignoredProps = mapping.ignoredProperties || [];
        const propsToThrowFor = checkArrayDiff(forgottenProps, ignoredProps);

        if (propsToThrowFor.length > 0) {
            throw PropertiesNotMappedError.createForProperties(propsToThrowFor, mapping.constructor);
        }

        return out as ObjectType;
    }

    reverseTransform(inputObject: Record<string, any>, mapping: ObjectMapping): EntityType {
        const instance = new mapping.constructor() as EntityType;

        EntityToObjectTransformer.forEachMappingProperty(mapping, (propertyMappingKey, propertyMapping) => {
            const inputKey = propertyMapping.as || propertyMappingKey;

            let value = inputObject[inputKey];

            if (value === undefined) {
                throw PropertyNotFoundInObjectError.createForProperty(inputKey, inputObject);
            }

            if (isObjectMapping(propertyMapping)) {
                value = Array.isArray(value)
                    ? value.map((item) => this.reverseTransform(item, propertyMapping))
                    : this.reverseTransform(value, propertyMapping);
            } else if (propertyMapping.transformer) {
                const { reverseTransform } = propertyMapping.transformer;

                value = Array.isArray(value) ? value.map((item) => reverseTransform(item)) : reverseTransform(value);
            }

            const success = Reflect.set(instance, propertyMappingKey, value);

            if (!success) {
                throw CouldNotAssignPropertyValueError.createForProperty(propertyMappingKey, mapping.constructor);
            }
        });

        return instance;
    }
}

export type PropValueTransformer<FromType = any, ToType = any> = {
    transform(from: FromType): ToType;
    reverseTransform(to: ToType): FromType;
};

type ClassConstructor<EntityType = {}> = {
    new (...args: any[]): EntityType;
    [key: string]: any;
};

type PropertyMapping = {
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
};

const isObjectMapping = (mapping: ObjectMapping | PropertyMapping): mapping is ObjectMapping => {
    // @ts-ignore In order to find out if this is ObjectMapping we need to check if type is there
    return mapping.type === 'object';
};

export default class EntityToObjectTransformer<
    EntityType extends Record<string, any>,
    ObjectType = Record<string, any>,
> {
    transform(entity: EntityType, mapping: ObjectMapping): ObjectType {
        const propertyMappingKeys = Object.keys(mapping.properties) as Array<
            Extract<keyof ObjectMapping['properties'], string>
        >;

        const out: Record<string, any> = {};

        propertyMappingKeys.forEach((propertyMappingKey) => {
            const propertyMapping = mapping.properties[propertyMappingKey];

            if (!propertyMapping) {
                throw new Error(
                    `Expecting property mapping for key '${propertyMappingKey}' to be available at this point`,
                );
            }

            const key = propertyMapping?.as || propertyMappingKey;

            let value = entity[propertyMappingKey];

            if (value === undefined) {
                throw new Error(`Could not find property '${key}' on entity: ${entity.toString()}`);
            }

            if (isObjectMapping(propertyMapping)) {
                value = Array.isArray(value)
                    ? value.map((item) => this.transform(item, propertyMapping))
                    : this.transform(value, propertyMapping);
            } else if (propertyMapping.transformer) {
                value = Array.isArray(value)
                    ? value.map((item) => propertyMapping.transformer.transform(item))
                    : propertyMapping.transformer.transform(value);
            }

            out[key] = value;
        });

        return out as ObjectType;
    }

    reverseTransform(inputObject: Record<string, any>, mapping: ObjectMapping): EntityType {
        const instance = new mapping.constructor() as EntityType;

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

            const inputKey = propertyMapping?.as || propertyMappingKey;

            let value = inputObject[inputKey];

            if (value === undefined) {
                throw new Error(`Could not find property '${inputKey}' on object: ${JSON.stringify(inputObject)}`);
            }

            if (isObjectMapping(propertyMapping)) {
                value = Array.isArray(value)
                    ? value.map((item) => this.reverseTransform(item, propertyMapping))
                    : this.reverseTransform(value, propertyMapping);
            } else if (propertyMapping.transformer) {
                value = Array.isArray(value)
                    ? value.map((item) => propertyMapping.transformer.reverseTransform(item))
                    : propertyMapping.transformer.reverseTransform(value);
            }

            const success = Reflect.set(instance, propertyMappingKey, value);

            if (!success) {
                throw new Error(`Could net set '${propertyMappingKey}' on instance: ${instance.name}`);
            }
        });

        return instance;
    }
}

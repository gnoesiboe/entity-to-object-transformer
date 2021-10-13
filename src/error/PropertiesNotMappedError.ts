import { ClassConstructor } from '../transformer/EntityToObjectTransformer';

export default class PropertiesNotMappedError extends Error {
    public static createForProperties(properties: string[], constructor: ClassConstructor) {
        return new PropertiesNotMappedError(
            `The following entity keys were not mapped on entity ${constructor.name}: '${properties.join(', ')}'`,
        );
    }
}

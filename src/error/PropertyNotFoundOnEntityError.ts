import { ClassConstructor } from '../transformer/EntityToObjectTransformer';

export default class PropertyNotFoundOnEntityError extends Error {
    public static createForProperty(property: string, constructor: ClassConstructor) {
        return new PropertyNotFoundOnEntityError(
            `Could not find property '${property}' on entity: ${constructor.name}`,
        );
    }
}

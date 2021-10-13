import { ClassConstructor } from '../transformer/EntityToObjectTransformer';

export default class CouldNotAssignPropertyValueError extends Error {
    public static createForProperty(property: string, constructor: ClassConstructor) {
        return new CouldNotAssignPropertyValueError(`Could net set '${property}' on instance: ${constructor.name}`);
    }
}

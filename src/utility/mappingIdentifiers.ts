import { ObjectMapping, PropertyMapping } from '../transformer/EntityToObjectTransformer';

export function isObjectMapping(mapping: ObjectMapping | PropertyMapping): mapping is ObjectMapping {
    return mapping.type === 'object';
}

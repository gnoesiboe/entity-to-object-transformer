import Uuid from '../../../domain/valueObject/Uuid';
import { PropValueTransformer } from '../decorator/mappedProp';

export default class UuidToStringTransformer implements PropValueTransformer<Uuid, string> {
    transform(uuid: Uuid): string {
        return uuid.toString();
    }

    reverseTransform(uuid: string): Uuid {
        return new Uuid(uuid);
    }
}

import { PropValueTransformer } from '../../../src/transformer/EntityToObjectTransformer';
import Color from '../entity/Color';
import Feature from '../entity/Feature';
import UuidToStringTransformer from './UuidToStringTransformer';

type ColorAsObject = {
    _id: string;
    name: string;
};

type FeatureAsObject = {
    _id: string;
    title: string;
};

export default class ProductAttributeToObjectTransformer
    implements PropValueTransformer<Color | Feature, ColorAsObject | FeatureAsObject>
{
    constructor(private readonly uuidToStringTransformer: UuidToStringTransformer) {}

    static isColorAsObject(input: ColorAsObject | FeatureAsObject): input is ColorAsObject {
        return input.name !== undefined;
    }

    static isFeatureAsObject(input: ColorAsObject | FeatureAsObject): input is FeatureAsObject {
        return input.title !== undefined;
    }

    reverseTransform(input: ColorAsObject | FeatureAsObject): Color | Feature {
        const uuid = this.uuidToStringTransformer.reverseTransform(input._id);

        if (ProductAttributeToObjectTransformer.isColorAsObject(input)) {
            return new Color(uuid, input.name);
        }

        if (ProductAttributeToObjectTransformer.isFeatureAsObject(input)) {
            return new Feature(uuid, input.title);
        }

        throw new Error('Input not supported');
    }

    transform(input: Color | Feature): ColorAsObject | FeatureAsObject {
        const _id = this.uuidToStringTransformer.transform(input.uuid);

        if (input instanceof Color) {
            return { _id, name: input.name };
        }

        if (input instanceof Feature) {
            return { _id, title: input.title };
        }

        throw new Error(`Unexpected instance received`);
    }
}

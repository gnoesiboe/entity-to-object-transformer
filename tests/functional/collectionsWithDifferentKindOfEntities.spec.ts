import Product from '../support/entity/Product';
import Feature from '../support/entity/Feature';
import Color from '../support/entity/Color';
import EntityToObjectTransformer from '../../src';
import { ObjectMapping } from '../../src/transformer/EntityToObjectTransformer';
import Uuid from '../support/valueObject/Uuid';
import UuidToStringTransformer from '../support/transformer/UuidToStringTransformer';
import ProductAttributeToObjectTransformer from '../support/transformer/ProductAttributeToObjectTransformer';

describe('Collection with different kind of entities', () => {
    let product: Product;
    let feature: Feature;
    let firstColor: Color;
    let secondColor: Color;
    let transformer: EntityToObjectTransformer<Product, any>;
    let productMapping: ObjectMapping;
    let productAsObject: Record<string, any>;

    beforeEach(() => {
        product = new Product(new Uuid(), 'Some product');

        firstColor = new Color(new Uuid(), 'Green');
        product.addAttribute(firstColor);

        feature = new Feature(new Uuid(), 'Some feature');
        product.addAttribute(feature);

        secondColor = new Color(new Uuid(), 'Yellow');
        product.addAttribute(secondColor);

        productMapping = {
            type: 'object',
            constructor: Product,
            properties: {
                uuid: {
                    type: 'property',
                    as: '_id',
                    transformer: new UuidToStringTransformer(),
                },
                name: {
                    type: 'property',
                },
                _attributes: {
                    type: 'property',
                    as: 'attributes',
                    transformer: new ProductAttributeToObjectTransformer(new UuidToStringTransformer()),
                },
            },
        };

        transformer = new EntityToObjectTransformer();

        productAsObject = productAsObject = transformer.transform(product, productMapping);
    });

    it('should be able to transform them to an object', () => {
        expect(productAsObject).toEqual({
            _id: product.uuid.toString(),
            name: product.name,
            attributes: [
                {
                    _id: firstColor.uuid.toString(),
                    name: firstColor.name,
                },
                {
                    _id: feature.uuid.toString(),
                    title: feature.title,
                },
                {
                    _id: secondColor.uuid.toString(),
                    name: secondColor.name,
                },
            ],
        });
    });

    it('should be able to transform them back to their original form', () => {
        const backAsProduct = transformer.reverseTransform(productAsObject, productMapping);

        expect(backAsProduct.uuid).toBeInstanceOf(Uuid);
        expect(backAsProduct.uuid.equals(product.uuid)).toBe(true);
        expect(backAsProduct.name).toEqual(product.name);

        const backAsFirstColor = backAsProduct.attributes[0];
        if (!(backAsFirstColor instanceof Color)) {
            throw new Error('Expecting value to be an instance of Color');
        }
        expect(backAsFirstColor).toBeInstanceOf(Color);
        expect(backAsFirstColor.uuid).toBeInstanceOf(Uuid);
        expect(backAsFirstColor.uuid.equals(firstColor.uuid)).toBe(true);
        expect(backAsFirstColor.name).toBe(firstColor.name);

        const backAsFeature = backAsProduct.attributes[1];
        if (!(backAsFeature instanceof Feature)) {
            throw new Error('Expecting value to be an instance of Feature');
        }
        expect(backAsFeature).toBeInstanceOf(Feature);
        expect(backAsFeature.uuid).toBeInstanceOf(Uuid);
        expect(backAsFeature.uuid.equals(feature.uuid)).toBe(true);
        expect(backAsFeature.title).toBe(feature.title);

        const backAsSecondColor = backAsProduct.attributes[2];
        if (!(backAsSecondColor instanceof Color)) {
            throw new Error('Expecting value to be an instance of Color');
        }
        expect(backAsSecondColor).toBeInstanceOf(Color);
        expect(backAsSecondColor.uuid).toBeInstanceOf(Uuid);
        expect(backAsSecondColor.uuid.equals(secondColor.uuid)).toBe(true);
        expect(backAsSecondColor.name).toBe(secondColor.name);
    });
});

import EntityToObjectTransformer from '../../src';
import Author from '../support/entity/Author';
import Uuid from '../support/valueObject/Uuid';
import { ObjectMapping } from '../../src/transformer/EntityToObjectTransformer';
import UuidToStringTransformer from '../support/transformer/UuidToStringTransformer';
import DateToStringTransformer from '../support/transformer/DateToStringTransformer';

type AuthorAsObjectType = {
    _id: string;
    name: string;
    createdAt: string;
};

const authorMapping: ObjectMapping = {
    type: 'object',
    constructor: Author,
    properties: {
        uuid: {
            type: 'property',
            as: '_id',
            transformer: new UuidToStringTransformer(),
        },
        _name: {
            as: 'name',
            type: 'property',
        },
        createdAt: {
            type: 'property',
            transformer: new DateToStringTransformer(),
        },
    },
};

describe('With a single entity', () => {
    let author: Author;
    let authorTransformer: EntityToObjectTransformer<Author, AuthorAsObjectType>;
    let authorAsObject: AuthorAsObjectType;

    beforeEach(() => {
        author = new Author(new Uuid(), 'Gijs Nieuwenhuis');
        authorTransformer = new EntityToObjectTransformer<Author, AuthorAsObjectType>();
        authorAsObject = authorTransformer.transform(author, authorMapping);
    });

    it('should work be able to transform it to an object', () => {
        expect(authorAsObject).toEqual({
            _id: author.uuid.toString(),
            name: author.name,
            createdAt: author.createdAt.toISOString(),
        });
    });

    describe('and when transformed back', () => {
        it('should match the input', () => {
            const outputAuthor = authorTransformer.reverseTransform(authorAsObject, authorMapping);

            expect(outputAuthor.uuid).toBeInstanceOf(Uuid);
            expect(outputAuthor.uuid.equals(author.uuid)).toBe(true);
            expect(outputAuthor.name).toBe(author.name);
            expect(outputAuthor.createdAt).toEqual(author.createdAt);
        });
    });
});

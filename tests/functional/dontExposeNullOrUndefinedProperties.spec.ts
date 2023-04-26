import EntityToObjectTransformer, { ObjectMapping } from '../../src/transformer/EntityToObjectTransformer';
import Author from '../support/entity/Author';
import UuidToStringTransformer from '../support/transformer/UuidToStringTransformer';
import DateToStringTransformer from '../support/transformer/DateToStringTransformer';
import BlogItem from '../support/entity/BlogItem';
import Uuid from '../support/valueObject/Uuid';

type AuthorAsObjectType = {
    _id: string;
    name: string;
    createdAt: string;
};

type BlogItemAsObjectType = {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    author: AuthorAsObjectType;
    tags: [];
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
        _initials: {
            as: 'initials',
            type: 'property',
        },
        createdAt: {
            type: 'property',
            transformer: new DateToStringTransformer(),
        },
    },
};

const blogItemMapping: ObjectMapping = {
    type: 'object',
    constructor: BlogItem,
    properties: {
        uuid: {
            type: 'property',
            as: '_id',
            transformer: new UuidToStringTransformer(),
        },
        _title: {
            as: 'title',
            type: 'property',
        },
        _description: {
            as: 'description',
            type: 'property',
        },
        createdAt: {
            type: 'property',
            transformer: new DateToStringTransformer(),
        },
        author: authorMapping,
        _tags: {
            as: 'tags',
            type: 'property',
        },
    },
    ignoredProperties: ['comments'],
};

describe("don't expose null or undefined properties", () => {
    let author: Author;
    let blogItem: BlogItem;
    let blogItemTransformer: EntityToObjectTransformer<BlogItem, BlogItemAsObjectType>;
    let blogItemAsObject: BlogItemAsObjectType;

    beforeEach(() => {
        author = new Author(new Uuid(), 'Gijs Nieuwenhuis');
        blogItem = new BlogItem(new Uuid(), 'Some title', 'Some description', author, [
            'entity',
            'mapping',
            'transformer',
        ]);

        blogItemTransformer = new EntityToObjectTransformer<BlogItem, BlogItemAsObjectType>(blogItemMapping, {
            exposeUndefinedOrNullValueProperties: false,
        });
        blogItemAsObject = blogItemTransformer.transform(blogItem);
    });

    it('exposes only properties that are not null or undefined', () => {
        expect(blogItemAsObject).toEqual({
            _id: blogItem.uuid.toString(),
            title: blogItem.title,
            description: blogItem.description,
            createdAt: blogItem.createdAt.toISOString(),
            author: {
                _id: author.uuid.toString(),
                name: author.name,
                createdAt: author.createdAt.toISOString(),
            },
            tags: ['entity', 'mapping', 'transformer'],
        });
    });
});

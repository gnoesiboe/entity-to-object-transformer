import BlogItem from '../support/entity/BlogItem';
import EntityToObjectTransformer from '../../src';
import Uuid from '../support/valueObject/Uuid';
import { ObjectMapping } from '../../src/transformer/EntityToObjectTransformer';
import Author from '../support/entity/Author';
import UuidToStringTransformer from '../support/transformer/UuidToStringTransformer';
import DateToStringTransformer from '../support/transformer/DateToStringTransformer';

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

describe('A nested entity', () => {
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
        blogItemTransformer = new EntityToObjectTransformer<BlogItem, BlogItemAsObjectType>(blogItemMapping);
        blogItemAsObject = blogItemTransformer.transform(blogItem);
    });

    it('should be able to transform it to an object', () => {
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

    describe('an when transformed back', () => {
        it('should match the input', () => {
            const outputBlogItem = blogItemTransformer.reverseTransform(blogItemAsObject);

            expect(outputBlogItem).toBeInstanceOf(BlogItem);
            expect(outputBlogItem.uuid).toBeInstanceOf(Uuid);
            expect(outputBlogItem.uuid.equals(blogItem.uuid)).toBe(true);
            expect(outputBlogItem.title).toEqual(blogItem.title);
            expect(outputBlogItem.description).toEqual(blogItem.description);
            expect(outputBlogItem.createdAt).toEqual(blogItem.createdAt);
            expect(outputBlogItem.author.uuid).toBeInstanceOf(Uuid);
            expect(outputBlogItem.author.uuid.equals(author.uuid)).toBe(true);
            expect(outputBlogItem.author.name).toEqual(author.name);
        });
    });
});

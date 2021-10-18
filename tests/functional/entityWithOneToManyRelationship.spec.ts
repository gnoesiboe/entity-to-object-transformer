import BlogItem from '../support/entity/BlogItem';
import EntityToObjectTransformer from '../../src';
import Uuid from '../support/valueObject/Uuid';
import Comment from '../support/entity/Comment';
import Author from '../support/entity/Author';
import { ObjectMapping } from '../../src/transformer/EntityToObjectTransformer';
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

type CommentAsObjectType = {
    _id: string;
    message: string;
};

type BlogItemAsObjectWithCommentsType = BlogItemAsObjectType & {
    comments: CommentAsObjectType[];
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

const blogItemWithCommentsMapping: ObjectMapping = {
    ...blogItemMapping,
    properties: {
        ...blogItemMapping.properties,
        comments: {
            type: 'object',
            as: 'comments',
            constructor: Comment,
            properties: {
                uuid: {
                    type: 'property',
                    as: '_id',
                    transformer: new UuidToStringTransformer(),
                },
                message: {
                    type: 'property',
                },
                createdAt: {
                    type: 'property',
                    transformer: new DateToStringTransformer(),
                },
            },
        },
    },
};

describe('With an entity with a one to many relation', () => {
    let author: Author;
    let blogItemWithComments: BlogItem;
    let blogItemWithCommentsAsObject: BlogItemAsObjectWithCommentsType;
    const blogItemTransformer = new EntityToObjectTransformer<BlogItem, BlogItemAsObjectWithCommentsType>(
        blogItemWithCommentsMapping,
    );

    beforeEach(() => {
        author = new Author(new Uuid(), 'Gijs Nieuwenhuis');
        blogItemWithComments = new BlogItem(new Uuid(), 'Some title', 'Some description', author, [
            'eerste',
            'tweede',
            'derde',
        ]);
        blogItemWithComments.addComment(new Comment(new Uuid(), 'Doing great!'));
        blogItemWithComments.addComment(new Comment(new Uuid(), 'Well done!'));

        blogItemWithCommentsAsObject = blogItemTransformer.transform(blogItemWithComments);
    });

    it('should be able to transform it to an object', () => {
        expect(blogItemWithComments).toBeInstanceOf(BlogItem);

        expect(blogItemWithCommentsAsObject).toEqual({
            _id: blogItemWithComments.uuid.toString(),
            title: blogItemWithComments.title,
            description: blogItemWithComments.description,
            createdAt: blogItemWithComments.createdAt.toISOString(),
            author: {
                _id: author.uuid.toString(),
                name: author.name,
                createdAt: author.createdAt.toISOString(),
            },
            comments: [
                {
                    _id: blogItemWithComments.comments[0].uuid.toString(),
                    message: blogItemWithComments.comments[0].message,
                    createdAt: blogItemWithComments.comments[0].createdAt.toISOString(),
                },
                {
                    _id: blogItemWithComments.comments[1].uuid.toString(),
                    message: blogItemWithComments.comments[1].message,
                    createdAt: blogItemWithComments.comments[1].createdAt.toISOString(),
                },
            ],
            tags: ['eerste', 'tweede', 'derde'],
        });
    });

    describe('an when transformed back', () => {
        it('should match the input', () => {
            const outputBlogItem = blogItemTransformer.reverseTransform(blogItemWithCommentsAsObject);

            expect(outputBlogItem).toBeInstanceOf(BlogItem);
            expect(outputBlogItem.uuid).toBeInstanceOf(Uuid);
            expect(outputBlogItem.uuid.equals(blogItemWithComments.uuid)).toBe(true);
            expect(outputBlogItem.title).toEqual(blogItemWithComments.title);
            expect(outputBlogItem.description).toEqual(blogItemWithComments.description);
            expect(outputBlogItem.createdAt).toEqual(blogItemWithComments.createdAt);

            expect(outputBlogItem.author.uuid).toBeInstanceOf(Uuid);
            expect(outputBlogItem.author.uuid.equals(author.uuid)).toBe(true);
            expect(outputBlogItem.author.name).toEqual(author.name);

            expect(outputBlogItem.comments[0]).toBeInstanceOf(Comment);
            expect(outputBlogItem.comments[0].uuid).toBeInstanceOf(Uuid);
            expect(outputBlogItem.comments[0].uuid.equals(blogItemWithComments.comments[0].uuid)).toBe(true);
            expect(outputBlogItem.comments[0].message).toEqual(blogItemWithComments.comments[0].message);

            expect(outputBlogItem.comments[1]).toBeInstanceOf(Comment);
            expect(outputBlogItem.comments[1].uuid).toBeInstanceOf(Uuid);
            expect(outputBlogItem.comments[1].uuid.equals(blogItemWithComments.comments[1].uuid)).toBe(true);
            expect(outputBlogItem.comments[1].message).toEqual(blogItemWithComments.comments[1].message);
        });
    });
});

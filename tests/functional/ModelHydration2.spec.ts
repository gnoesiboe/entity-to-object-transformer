import Uuid from '../../src/domain/valueObject/Uuid';
import Author from '../../src/domain/entity/Author';
import EntityToObjectTransformer, {
    ObjectMapping,
} from '../../src/infrastructure/database/transformer/EntityToObjectTransformer';
import UuidToStringTransformer from '../../src/infrastructure/database/transformer/UuidToStringTransformer';
import BlogItem from '../../src/domain/entity/BlogItem';
import DateToStringTransformer from '../../src/infrastructure/database/transformer/DateToStringTransformer';
import Comment from '../../src/domain/entity/Comment';

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
    },
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
            },
        },
    },
};

describe('EntityToObjectTransformer', () => {
    let author: Author;

    beforeEach(() => {
        author = new Author(new Uuid(), 'Gijs Nieuwenhuis');
    });

    describe('With a single entity', () => {
        let authorTransformer: EntityToObjectTransformer<Author, AuthorAsObjectType>;
        let authorAsObject: AuthorAsObjectType;

        beforeEach(() => {
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

    describe('With a nested entity', () => {
        let blogItem: BlogItem;
        let blogItemTransformer: EntityToObjectTransformer<BlogItem, BlogItemAsObjectType>;
        let blogItemAsObject: BlogItemAsObjectType;

        beforeEach(() => {
            blogItem = new BlogItem(new Uuid(), 'Some title', 'Some description', author);
            blogItemTransformer = new EntityToObjectTransformer<BlogItem, BlogItemAsObjectType>();
            blogItemAsObject = blogItemTransformer.transform(blogItem, blogItemMapping);
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
            });
        });

        describe('an when transformed back', () => {
            it('should match the input', () => {
                const outputBlogItem = blogItemTransformer.reverseTransform(blogItemAsObject, blogItemMapping);

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

    describe('With an entity with a one to many relation', () => {
        let blogItemWithComments: BlogItem;
        let blogItemWithCommentsAsObject: BlogItemAsObjectWithCommentsType;
        const blogItemTransformer = new EntityToObjectTransformer<BlogItem, BlogItemAsObjectWithCommentsType>();

        beforeEach(() => {
            blogItemWithComments = new BlogItem(new Uuid(), 'Some title', 'Some description', author);
            blogItemWithComments.addComment(new Comment(new Uuid(), 'Doing great!'));
            blogItemWithComments.addComment(new Comment(new Uuid(), 'Well done!'));

            blogItemWithCommentsAsObject = blogItemTransformer.transform(
                blogItemWithComments,
                blogItemWithCommentsMapping,
            );
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
                    },
                    {
                        _id: blogItemWithComments.comments[1].uuid.toString(),
                        message: blogItemWithComments.comments[1].message,
                    },
                ],
            });
        });

        describe('an when transformed back', () => {
            it('should match the input', () => {
                const outputBlogItem = blogItemTransformer.reverseTransform(
                    blogItemWithCommentsAsObject,
                    blogItemWithCommentsMapping,
                );

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
});

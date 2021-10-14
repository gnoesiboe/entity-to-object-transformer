import Uuid from './support/valueObject/Uuid';
import Author from './support/entity/Author';
import EntityToObjectTransformer, { ObjectMapping } from '../src/transformer/EntityToObjectTransformer';
import UuidToStringTransformer from './support/transformer/UuidToStringTransformer';
import BlogItem from './support/entity/BlogItem';
import DateToStringTransformer from './support/transformer/DateToStringTransformer';
import Comment from './support/entity/Comment';
import PropertiesNotMappedError from '../src/error/PropertiesNotMappedError';
import PropertyNotFoundOnEntityError from '../src/error/PropertyNotFoundOnEntityError';
import PropertyNotFoundInObjectError from '../src/error/PropertyNotFoundInObjectError';
import Editor from './support/entity/Editor';

type AuthorAsObjectType = {
    _id: string;
    name: string;
    createdAt: string;
};

type EditorAsObjectType = AuthorAsObjectType & {
    alias: string;
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
                        createdAt: blogItemWithComments.comments[0].createdAt.toISOString(),
                    },
                    {
                        _id: blogItemWithComments.comments[1].uuid.toString(),
                        message: blogItemWithComments.comments[1].message,
                        createdAt: blogItemWithComments.comments[1].createdAt.toISOString(),
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

    describe('When not all properties are mapped', () => {
        describe('With a single entity with no nesting', () => {
            describe('and it told to throw when not', () => {
                it('should throw', () => {
                    const transformer = new EntityToObjectTransformer<Author, AuthorAsObjectType>();

                    const execute = () =>
                        transformer.transform(author, {
                            type: 'object',
                            constructor: Author,
                            properties: {
                                uuid: {
                                    type: 'property',
                                },
                            },
                        });

                    expect(execute).toThrow(PropertiesNotMappedError);
                });
            });

            describe('and it is told to not throw', () => {
                it('should not throw', () => {
                    const transformer = new EntityToObjectTransformer<Author, AuthorAsObjectType>();

                    const execute = () =>
                        transformer.transform(author, {
                            type: 'object',
                            constructor: Author,
                            properties: {
                                uuid: {
                                    type: 'property',
                                },
                                _name: {
                                    type: 'property',
                                },
                                createdAt: {
                                    type: 'property',
                                },
                            },
                        });

                    expect(execute).not.toThrow();
                });
            });
        });

        describe('With an valid entity with invalid nested entities in it ', () => {
            it('should throw', () => {
                const transformer = new EntityToObjectTransformer<BlogItem, BlogItemAsObjectType>();
                const blogItem = new BlogItem(new Uuid(), 'Some title', 'Some description', author);

                const execute = () =>
                    transformer.transform(blogItem, {
                        type: 'object',
                        constructor: BlogItem,
                        properties: {
                            uuid: {
                                type: 'property',
                            },
                            _title: {
                                type: 'property',
                            },
                            _description: {
                                type: 'property',
                            },
                            author: {
                                type: 'object',
                                constructor: Author,
                                properties: {
                                    uuid: {
                                        type: 'property',
                                    },
                                    // missing _name, createdAt
                                },
                            },
                        },
                    });

                expect(execute).toThrow(PropertiesNotMappedError);
            });
        });
    });

    describe('When mapping an non existent property', () => {
        describe('when transforming', () => {
            it('should throw', () => {
                const transformer = new EntityToObjectTransformer<Author, AuthorAsObjectType>();

                const execute = () =>
                    transformer.transform(author, {
                        type: 'object',
                        constructor: Author,
                        properties: {
                            nonThere: {
                                type: 'property',
                            },
                        },
                    });

                expect(execute).toThrow(PropertyNotFoundOnEntityError);
            });
        });

        describe('When reverse transforming', () => {
            it('should throw', () => {
                const transformer = new EntityToObjectTransformer<Author, AuthorAsObjectType>();

                const correctMapping: ObjectMapping = {
                    type: 'object',
                    constructor: Author,
                    properties: {
                        uuid: {
                            type: 'property',
                            transformer: new UuidToStringTransformer(),
                        },
                        _name: {
                            type: 'property',
                        },
                        createdAt: {
                            type: 'property',
                        },
                    },
                };

                const authorAsObject = transformer.transform(author, correctMapping);

                const executeReverseTransform = () =>
                    transformer.reverseTransform(authorAsObject, {
                        ...correctMapping,
                        properties: {
                            ...correctMapping.properties,
                            notThere: {
                                type: 'property',
                            },
                        },
                    });

                expect(executeReverseTransform).toThrow(PropertyNotFoundInObjectError);
            });
        });
    });

    describe('When applying inheritance', () => {
        describe('When transforming the entity to an object', () => {
            let transformer: EntityToObjectTransformer<Editor, EditorAsObjectType>;
            let editor: Editor;
            let mapping: ObjectMapping;
            let editorAsObject: AuthorAsObjectType & { alias: string };

            beforeEach(() => {
                transformer = new EntityToObjectTransformer<Editor, EditorAsObjectType>();

                editor = new Editor(new Uuid(), 'Eva Prong', 'evi');

                mapping = {
                    type: 'object',
                    constructor: Editor,
                    properties: {
                        uuid: {
                            type: 'property',
                            transformer: new UuidToStringTransformer(),
                        },
                        _name: {
                            type: 'property',
                            as: 'name',
                        },
                        createdAt: {
                            type: 'property',
                        },
                        alias: {
                            type: 'property',
                        },
                    },
                };

                editorAsObject = transformer.transform(editor, mapping);
            });

            it('works as expected', () => {
                expect(editorAsObject).toEqual({
                    uuid: editor.uuid.toString(),
                    name: editor.name,
                    createdAt: editor.createdAt,
                    alias: editor.alias,
                });
            });

            describe('and when transforming back', () => {
                it('becomes the same as the inputted entity', () => {
                    const backAsEditor = transformer.reverseTransform(editorAsObject, mapping);

                    expect(backAsEditor.uuid).toBeInstanceOf(Uuid);
                    expect(backAsEditor.uuid.equals(editor.uuid)).toBe(true);
                    expect(backAsEditor.name).toEqual(editor.name);
                    expect(backAsEditor.createdAt).toEqual(editor.createdAt);
                    expect(backAsEditor.alias).toEqual(editor.alias);
                });
            });
        });
    });

    // @todo be able to use custom collections
    // @todo convert to NPM package
});

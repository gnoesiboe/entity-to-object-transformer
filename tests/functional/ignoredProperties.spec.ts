import Uuid from '../support/valueObject/Uuid';
import Author from '../support/entity/Author';
import EntityToObjectTransformer, { ObjectMapping } from '../../src/transformer/EntityToObjectTransformer';
import UuidToStringTransformer from '../support/transformer/UuidToStringTransformer';
import BlogItem from '../support/entity/BlogItem';
import DateToStringTransformer from '../support/transformer/DateToStringTransformer';
import PropertiesNotMappedError from '../../src/error/PropertiesNotMappedError';
import PropertyNotFoundOnEntityError from '../../src/error/PropertyNotFoundOnEntityError';
import PropertyNotFoundInObjectError from '../../src/error/PropertyNotFoundInObjectError';

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

describe('EntityToObjectTransformer', () => {
    let author: Author;

    beforeEach(() => {
        author = new Author(new Uuid(), 'Gijs Nieuwenhuis');
    });

    describe('When not all properties are mapped', () => {
        describe('With a single entity with no nesting', () => {
            describe('and it told to throw when not', () => {
                it('should throw', () => {
                    const transformer = new EntityToObjectTransformer<Author, AuthorAsObjectType>({
                        type: 'object',
                        constructor: Author,
                        properties: {
                            uuid: {
                                type: 'property',
                            },
                        },
                    });

                    const execute = () => transformer.transform(author);

                    expect(execute).toThrow(PropertiesNotMappedError);
                });
            });

            describe('and it is told to not throw', () => {
                it('should not throw', () => {
                    const transformer = new EntityToObjectTransformer<Author, AuthorAsObjectType>({
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

                    const execute = () => transformer.transform(author);

                    expect(execute).not.toThrow();
                });
            });
        });

        describe('With an valid entity with invalid nested entities in it ', () => {
            it('should throw', () => {
                const transformer = new EntityToObjectTransformer<BlogItem, BlogItemAsObjectType>({
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
                const blogItem = new BlogItem(new Uuid(), 'Some title', 'Some description', author);

                const execute = () => transformer.transform(blogItem);

                expect(execute).toThrow(PropertiesNotMappedError);
            });
        });
    });

    describe('When mapping an non existent property', () => {
        describe('when transforming', () => {
            it('should throw', () => {
                const transformer = new EntityToObjectTransformer<Author, AuthorAsObjectType>({
                    type: 'object',
                    constructor: Author,
                    properties: {
                        nonThere: {
                            type: 'property',
                        },
                    },
                });

                const execute = () => transformer.transform(author);

                expect(execute).toThrow(PropertyNotFoundOnEntityError);
            });
        });
    });

    // @todo tests for utility functions
    // @todo output type should be on trnasform functions as that is where you supply the mapping that generates it
});

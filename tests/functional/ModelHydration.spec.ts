import BlogItem from '../../src/domain/entity/BlogItem';
import Author from '../../src/domain/entity/Author';
import { HydratedEntityInterface } from '../../src/infrastructure/database/decorator/hydrateable';

describe('ModelHydration', () => {
    describe('When you insert a single-level, hydratable', () => {
        let authorUuid: string;
        let authorName: string;
        let sourceAuthor: Author;

        beforeEach(() => {
            authorUuid = '82dcb5e6-19f8-4b08-83dd-0ce429142737';
            authorName = 'Peter Pan';

            sourceAuthor = new Author(authorUuid, authorName);
        });

        describe('and you transform it to a native object', () => {
            it('matches the instance values', () => {
                const asNativeObject = (sourceAuthor as unknown as HydratedEntityInterface<Author>).asNativeObject();

                expect(asNativeObject).toEqual({
                    uuid: authorUuid,
                    name: authorName,
                });
            });

            describe('and when you transfer it back', () => {
                it('matches the input', () => {
                    const asNativeObject = (
                        sourceAuthor as unknown as HydratedEntityInterface<Author>
                    ).asNativeObject();

                    const reCreatedAuthor = Author.fromNativeObject(asNativeObject, {
                        item: Author,
                    }) as Author;

                    expect(reCreatedAuthor).toBeInstanceOf(Author);
                    expect(reCreatedAuthor.uuid).toEqual(authorUuid);
                    expect(reCreatedAuthor.name).toEqual(authorName);
                });
            });
        });
    });

    describe('When you insert a hydratable with a child relation that is a hydratable also', () => {
        let authorUuid: string;
        let authorName: string;

        let blogUuid: string;
        let blogTitle: string;
        let blogDescription: string;

        let author: Author;
        let blogItem: BlogItem;

        beforeEach(() => {
            authorUuid = '82dcb5e6-19f8-4b08-83dd-0ce429142737';
            authorName = 'Peter Pan';

            blogUuid = 'ed449112-68a3-45da-8325-60803720899f';
            blogTitle = 'Some title';
            blogDescription = 'Some blog description';

            author = new Author(authorUuid, authorName);
            blogItem = new BlogItem(blogUuid, blogTitle, blogDescription, author);
        });

        describe('and you transform it to a native object', () => {
            it('values match the constructors', () => {
                expect(blogItem.asNativeObject()).toEqual({
                    uuid: blogUuid,
                    title: blogTitle,
                    description: blogDescription,
                    createdAt: blogItem.createdAt,
                    author: {
                        uuid: authorUuid,
                        name: authorName,
                    },
                });
            });

            describe('and you transform it back', () => {
                it('matches the input', () => {
                    const asNativeObject = (blogItem as unknown as HydratedEntityInterface<Author>).asNativeObject();

                    const reCreatedBlogItem = BlogItem.fromNativeObject(asNativeObject, {
                        item: BlogItem,
                        children: {
                            author: {
                                item: Author,
                            },
                        },
                    }) as BlogItem;

                    expect(reCreatedBlogItem).toBeInstanceOf(BlogItem);
                    expect(reCreatedBlogItem.uuid).toEqual(blogUuid);
                    expect(reCreatedBlogItem.title).toEqual(blogTitle);

                    expect(reCreatedBlogItem.author).toBeInstanceOf(Author);
                    expect(reCreatedBlogItem.author.uuid).toEqual(authorUuid);
                    expect(reCreatedBlogItem.author.name).toEqual(authorName);
                });
            });
        });
    });

    // @todo clean up for read- and mainability
    // @todo typescript types for constructor
    // @todo handling of value objects (custom handlers?)
    // @todo inheritance (is that even a problem?)
    // @todo supply the hydration mapping through the decorator instead of in `fromNativeObject` function
});

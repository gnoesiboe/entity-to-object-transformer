import BlogItem from '../../src/domain/entity/BlogItem';
import Author from '../../src/domain/entity/Author';
import Uuid from '../../src/domain/valueObject/Uuid';

describe.skip('ModelHydration', () => {
    describe('When you insert a single-level, hydratable', () => {
        let authorUuid: Uuid;
        let authorName: string;
        let sourceAuthor: Author;

        beforeEach(() => {
            authorUuid = new Uuid();
            authorName = 'Peter Pan';
            sourceAuthor = new Author(authorUuid, authorName);
        });

        describe('and you transform it to a native object', () => {
            let serialized: any;

            beforeEach(() => {
                serialized = sourceAuthor.serialize();
            });

            it('matches the instance values', () => {
                expect(serialized).toEqual({
                    _id: authorUuid.toString(),
                    name: authorName,
                    createdAt: sourceAuthor.createdAt,
                });
            });

            describe('and when you transfer it back', () => {
                it('matches the input', () => {
                    const reCreatedAuthor = Author.unserialize(serialized);

                    expect(reCreatedAuthor).toBeInstanceOf(Author);
                    expect(reCreatedAuthor.uuid).toBeInstanceOf(Uuid);
                    expect(reCreatedAuthor.uuid.equals(authorUuid)).toBe(true);
                    expect(reCreatedAuthor.name).toEqual(authorName);
                    expect(reCreatedAuthor.createdAt).toEqual(sourceAuthor.createdAt);
                });
            });
        });
    });

    describe('When you insert a hydratable with a child relation that is a hydratable also', () => {
        let authorUuid: Uuid;
        let authorName: string;

        let blogUuid: Uuid;
        let blogTitle: string;
        let blogDescription: string;

        let author: Author;
        let blogItem: BlogItem;

        beforeEach(() => {
            authorUuid = new Uuid();
            authorName = 'Peter Pan';

            blogUuid = new Uuid();
            blogTitle = 'Some title';
            blogDescription = 'Some blog description';

            author = new Author(authorUuid, authorName);
            blogItem = new BlogItem(blogUuid, blogTitle, blogDescription, author);
        });

        describe('and you transform it to a native object', () => {
            let serialized: any;

            beforeEach(() => {
                serialized = blogItem.serialize();
            });

            it('values match the constructors', () => {
                expect(serialized).toEqual({
                    _id: blogUuid.toString(),
                    title: blogTitle,
                    description: blogDescription,
                    createdAt: blogItem.createdAt,
                    author: {
                        _id: authorUuid.toString(),
                        name: authorName,
                        createdAt: author.createdAt,
                    },
                });
            });

            describe('and you transform it back', () => {
                it('matches the input', () => {
                    const reCreatedBlogItem = BlogItem.unserialize(serialized);

                    expect(reCreatedBlogItem).toBeInstanceOf(BlogItem);
                    expect(reCreatedBlogItem.uuid).toBeInstanceOf(Uuid);
                    expect(reCreatedBlogItem.uuid.equals(blogUuid)).toBe(true);
                    expect(reCreatedBlogItem.title).toEqual(blogTitle);
                    expect(reCreatedBlogItem.createdAt).toEqual(blogItem.createdAt);

                    expect(reCreatedBlogItem.author).toBeInstanceOf(Author);
                    expect(reCreatedBlogItem.author.uuid).toBeInstanceOf(Uuid);
                    expect(reCreatedBlogItem.author.uuid.equals(authorUuid)).toBe(true);
                    expect(reCreatedBlogItem.author.name).toEqual(authorName);
                    expect(reCreatedBlogItem.author.createdAt).toEqual(author.createdAt);
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

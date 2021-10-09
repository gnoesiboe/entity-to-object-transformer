import BlogItemDocument from '../model/BlogItemDocument';
import BlogItem from '../../../domain/entity/BlogItem';
import BlogItemToDocumentTransformer from '../transformer/BlogItemToDocumentTransformer';

export default class BlogItemRepository {
    private blogItemDocuments: BlogItemDocument[] = [
        {
            _id: '7c127aa3-bf97-4eb8-8888-96b80486527d',
            title: 'Some first title',
            description: 'Some first description',
            author: {
                _id: '7485ddb2-df23-4a3a-960d-dedcb235f360',
                name: 'Peter pan',
            },
        },
        {
            _id: '8053c8cf-b9b4-494d-9090-7770229c2626',
            title: 'Some second title',
            description: 'Some second description',
            author: {
                _id: '675f745a-c25f-470e-ba0a-f48e1e102b86',
                name: 'Jan Klaassen',
            },
        },
    ];

    public constructor(private readonly transformer: BlogItemToDocumentTransformer) {}

    async findOneWithId(uuid: string): Promise<BlogItem | null> {
        const document = this.blogItemDocuments.find((cursorItem) => cursorItem._id === uuid);

        if (!document) {
            return null;
        }

        return this.transformer.reverseTransform(document);
    }

    async save(blogItem: BlogItem): Promise<void> {
        const document = this.transformer.transform(blogItem);

        this.blogItemDocuments.push(document);
    }
}

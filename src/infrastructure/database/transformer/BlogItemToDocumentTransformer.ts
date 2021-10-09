import BlogItem from '../../../domain/entity/BlogItem';
import BlogItemDocument from '../model/BlogItemDocument';

export default class BlogItemToDocumentTransformer {
    transform(blogItem: BlogItem): BlogItemDocument {
        //
    }

    reverseTransform(document: BlogItemDocument): BlogItem {
        BlogItem.createFromDocument(document);
    }
}

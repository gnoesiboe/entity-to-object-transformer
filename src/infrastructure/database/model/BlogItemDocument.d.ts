import AuthorDocument from './AuthorDocument';

export default interface BlogItemDocument {
    readonly _id: string;
    readonly title: string;
    readonly description: string;
    readonly author: AuthorDocument;
}

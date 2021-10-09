import Author from './Author';
import hydrateable from '../../infrastructure/database/decorator/hydrateable';

@hydrateable
export default class BlogItem {
    constructor(
        public readonly uuid: string,
        private _title: string,
        private _description: string,
        public readonly author: Author,
    ) {}

    // createFromDocument(document: BlogItemDocument): BlogItem {
    //     const author = Author.createFromDocument(document.author);
    //
    //     return new BlogItem(document._id, document.title, document.description, author);
    // }

    get title() {
        return this._title;
    }

    set title(title: string) {
        this._title = title;
    }

    get description() {
        return this._description;
    }
}

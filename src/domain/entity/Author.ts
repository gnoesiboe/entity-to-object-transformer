import AuthorDocument from '../../infrastructure/database/model/AuthorDocument';
import hydrateable from '../../infrastructure/database/decorator/hydrateable';

@hydrateable
export default class Author {
    constructor(public readonly uuid: string, private _name: string) {}

    public static createFromDocument(document: AuthorDocument): Author {
        return new Author(document._id, document.name);
    }

    get name() {
        return this._name;
    }
}

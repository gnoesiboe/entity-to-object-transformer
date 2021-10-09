import Author from './Author';
import hydrateable from '../../infrastructure/database/decorator/hydrateable';

@hydrateable
export default class BlogItem {
    private readonly _createdAt: Date;

    constructor(
        public readonly uuid: string,
        private _title: string,
        private _description: string,
        public readonly author: Author,
    ) {
        this._createdAt = new Date();
    }

    get title() {
        return this._title;
    }

    set title(title: string) {
        this._title = title;
    }

    get description() {
        return this._description;
    }

    get createdAt() {
        return this._createdAt;
    }
}

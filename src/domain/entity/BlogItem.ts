import Author from './Author';
import Uuid from '../valueObject/Uuid';
import { MappingStrategy, serializable } from '../../infrastructure/database/decorator/mappedProp';

@serializable<BlogItem>({
    strategy: MappingStrategy.ObjectProperties,
    properties: {
        uuid: {
            alternateName: '_id',
            inherit: Uuid,
        },
        _title: {
            alternateName: 'title',
        },
        _description: {
            alternateName: 'description',
        },
        author: {
            inherit: Author,
        },
        createdAt: {},
    },
})
export default class BlogItem {
    public readonly createdAt: Date;

    constructor(
        public readonly uuid: Uuid,
        private _title: string,
        private _description: string,
        public readonly author: Author,
    ) {
        this.createdAt = new Date();
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
}

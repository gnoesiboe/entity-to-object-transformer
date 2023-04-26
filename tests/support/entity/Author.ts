import Uuid from '../valueObject/Uuid';

export default class Author {
    public readonly createdAt: Date;

    constructor(
        public readonly uuid: Uuid,
        private readonly _name: string,
        private readonly _initials: string | null = null
    ) {
        this.createdAt = new Date();
    }

    get name() {
        return this._name;
    }

    get initials(): string | null {
        return this._initials;
    }
}

import Uuid from '../valueObject/Uuid';

export default class Author {
    public readonly createdAt: Date;

    constructor(public readonly uuid: Uuid, private readonly _name: string) {
        this.createdAt = new Date();
    }

    get name() {
        return this._name;
    }
}

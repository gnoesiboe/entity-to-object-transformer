import Uuid from '../valueObject/Uuid';

export default class Comment {
    public readonly createdAt: Date;

    constructor(public readonly uuid: Uuid, public readonly message: string) {
        this.createdAt = new Date();
    }
}

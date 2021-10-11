import { serializable, MappingStrategy } from '../../infrastructure/database/decorator/mappedProp';
import 'reflect-metadata';
import Uuid from '../valueObject/Uuid';

@serializable<Author>({
    strategy: MappingStrategy.ObjectProperties,
    properties: {
        uuid: {
            alternateName: '_id',
            inherit: Uuid,
        },
        _name: {
            alternateName: 'name',
        },
        createdAt: {},
    },
})
export default class Author {
    public readonly createdAt: Date;

    constructor(public readonly uuid: Uuid, private readonly _name: string) {
        this.createdAt = new Date();
    }

    get name() {
        return this._name;
    }
}

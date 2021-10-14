import Author from './Author';
import Uuid from '../valueObject/Uuid';

export default class Editor extends Author {
    constructor(uuid: Uuid, _name: string, public readonly alias: string) {
        super(uuid, _name);
    }
}

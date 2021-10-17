import Uuid from "../valueObject/Uuid";

export default class Color {
    constructor(public readonly uuid: Uuid, public readonly name: string) {
    }
}

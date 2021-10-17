import Uuid from "../valueObject/Uuid";

export default class Feature {
    constructor(public readonly uuid: Uuid, public readonly title: string) {}
}

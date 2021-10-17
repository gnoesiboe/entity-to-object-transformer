import Uuid from "../valueObject/Uuid";
import Feature from "./Feature";
import Color from "./Color";

export default class Product {
    private _attributes: Array<Color | Feature> = [];

    constructor(public readonly uuid: Uuid, public readonly name: string) {}

    addAttribute(attribute: Color | Feature) {
        this._attributes.push(attribute);
    }

    get attributes() {
        return [...this._attributes];
    }
}

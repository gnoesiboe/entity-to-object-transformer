import { v4, validate, version } from 'uuid';

export default class Uuid {
    public readonly value: string;

    public constructor(value?: string) {
        if (value) {
            Uuid.validateValue(value);

            this.value = value;
        } else {
            this.value = v4();
        }
    }

    private static validateValue(value: string): void {
        const isValid = validate(value);

        if (!isValid) {
            throw new Error(`value '${value}' is not a valid uuid`);
        }

        if (version(value) !== 4) {
            throw new Error(`value '${value}' is not a valid v4 uuid`);
        }
    }

    equals(uuid: Uuid): boolean {
        return uuid.value === this.value;
    }

    toString(): string {
        return this.value;
    }
}

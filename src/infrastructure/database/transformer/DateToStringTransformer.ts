import { PropValueTransformer } from './EntityToObjectTransformer';

export default class DateToStringTransformer implements PropValueTransformer<Date, string> {
    transform(from: Date): string {
        return from.toISOString();
    }

    reverseTransform(to: string): Date {
        return new Date(to);
    }
}

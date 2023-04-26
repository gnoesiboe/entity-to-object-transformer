import { deleteUndefinedOrNullValuePropertiesFromObject } from './objectUtilities';

describe('object utilities', () => {
    describe('when called with a simple object', () => {
        const exampleRecord = {
            first: 'string',
            second: null,
            third: undefined,
            fourth: 0,
        };

        let result: Record<string, any>;

        beforeEach(() => {
            result = deleteUndefinedOrNullValuePropertiesFromObject(exampleRecord);
        });

        it('returns the expected result', () => {
            expect(result).toEqual({
                first: 'string',
                fourth: 0,
            });
        });
    });

    describe('when called with a nested object', () => {
        const exampleRecord = {
            first: 'string',
            nested: {
                second: null,
                third: undefined,
                fourth: 0,
            },
        };

        let result: Record<string, any>;

        beforeEach(() => {
            result = deleteUndefinedOrNullValuePropertiesFromObject(exampleRecord);
        });

        it('returns the expected result', () => {
            expect(result).toEqual({
                first: 'string',
                nested: {
                    fourth: 0,
                },
            });
        });
    });

    describe('when called with a nested array of objects', () => {
        const exampleRecord = {
            first: 'string',
            nested: [
                {
                    second: null,
                    third: undefined,
                    fourth: 0,
                },
                {
                    fifth: 5,
                },
            ],
            nestedOther: ['string', 'test', null, undefined],
        };

        let result: Record<string, any>;

        beforeEach(() => {
            result = deleteUndefinedOrNullValuePropertiesFromObject(exampleRecord);
        });

        it('returns the expected result', () => {
            expect(result).toEqual({
                first: 'string',
                nested: [
                    {
                        fourth: 0,
                    },
                    {
                        fifth: 5,
                    },
                ],
                nestedOther: ['string', 'test', null, undefined],
            });
        });
    });
});

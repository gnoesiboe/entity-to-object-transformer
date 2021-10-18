import { checkArrayDiff } from '../../../src/utility/arrayComparisonUtilities';

describe('arrayComparisonUtilities', () => {
    describe('When two identical array instances are supplied', () => {
        it('should return an empty array', () => {
            const someArray = ['eerste', 'tweede'];

            expect(checkArrayDiff(someArray, someArray)).toEqual([]);
        });
    });

    describe('When two different instances with exactly the same contents are supplied', () => {
        it('should return an empty array', () => {
            const firstArray = ['eerste', 'tweede'];
            const secondArray = ['eerste', 'tweede'];

            expect(checkArrayDiff(firstArray, secondArray)).toEqual([]);
        });
    });

    describe('When two different instances with the same contents, but in a different order are supplied', () => {
        it('should return an empty array', () => {
            const firstArray = ['eerste', 'tweede'];
            const secondArray = ['tweede', 'eerste'];

            expect(checkArrayDiff(firstArray, secondArray)).toEqual([]);
        });
    });

    describe.each([
        [['first', 'second'], ['first'], ['second']],
        [['first', 'second', 'third'], ['first', 'third'], ['second']],
        [['first', 'second', 'third'], ['third'], ['first', 'second']],
    ])(
        'When two different arrays are supplied',
        (firstArray: Array<any>, secondArray: Array<any>, expectedResult: Array<any>) => {
            it('should return the diff', () => {
                expect(checkArrayDiff(firstArray, secondArray)).toEqual(expectedResult);
            });
        },
    );
});

export function extractConstructorParameterNames<ReturnType extends string[] = string[]>(
    constructor: Function,
): ReturnType {
    return constructor
        .toString()
        .split('\n')[1]
        .trim()
        .replace(/^constructor\(/, '')
        .replace(/\) {$/, '')
        .split(/\s*,\s*/)
        .map((cursorItem) => cursorItem.replace(/^_/, '')) as ReturnType;
}

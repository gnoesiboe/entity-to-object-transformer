export function checkArrayDiff(first: string[], second: string[]): string[] {
    return first.filter((cursorItem) => !second.includes(cursorItem));
}

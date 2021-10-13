export default class PropertyNotFoundInObjectError extends Error {
    public static createForProperty(property: string, object: Record<string, any>) {
        return new PropertyNotFoundInObjectError(
            `Could not find property '${property}' on object: ${JSON.stringify(object)}`,
        );
    }
}

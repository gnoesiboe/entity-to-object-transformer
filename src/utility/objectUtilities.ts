export type NoUndefinedOrNullValuedField<T extends Record<string, any>> = {
    [P in keyof T]-?: Exclude<T[P], undefined | null>;
};

export function deleteUndefinedOrNullValuePropertiesFromObject<T extends Record<string, any>>(
    object: Record<string, any>,
): NoUndefinedOrNullValuedField<T> {
    const keys = Object.keys(object) as Array<keyof object>;

    keys.forEach((key) => {
        let value = object[key] as any;

        if (value === null || value === undefined) {
            delete object[key];
        } else if (Array.isArray(value)) {
            value.forEach((item) => {
                if (isObject(item)) {
                    deleteUndefinedOrNullValuePropertiesFromObject(item);
                }
            });
        } else if (isObject(value)) {
            deleteUndefinedOrNullValuePropertiesFromObject(value);
        }
    });

    return object as NoUndefinedOrNullValuedField<T>;
}

export function isObject(value: any): value is Record<string, any> {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

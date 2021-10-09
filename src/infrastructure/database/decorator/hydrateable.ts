import { extractConstructorParameterNames } from '../utility/classReflectionUtilities';

export interface HydratedEntityInterface<EntityType> {
    asNativeObject: () => NativeObject<EntityType>;
}

type NativeObject<EntityType> = Record<keyof EntityType, EntityType[keyof EntityType]>;

export type Mapping = {
    item: Record<string, any>;
    children?: {
        [key: string]: Mapping;
    };
};

export type ConstructorValues<EntityType> = Array<Extract<keyof EntityType, string>>;

export interface HydrateableEntityConstructor<EntityType> {
    new (...args: any[]): HydratedEntityInterface<EntityType>;
}

export default function hydrateable<EntityType extends { new (...args: any[]): {} }>(constructor: EntityType) {
    return class HydratedEntity extends constructor {
        public readonly __isHydrated: boolean = true;

        public static fromNativeObject = (nativeObject: NativeObject<EntityType>, mapping: Mapping) => {
            const constructorParameterNames =
                extractConstructorParameterNames<ConstructorValues<EntityType>>(constructor);

            const constructorValues = constructorParameterNames.map((cursorArgumentName) => {
                let value = nativeObject[cursorArgumentName];

                if (typeof value === 'undefined') {
                    throw new Error(`Could not resolve constructor value for key: '${cursorArgumentName}'`);
                }

                if (typeof value === 'object') {
                    const childMapping: Mapping | undefined = mapping.children
                        ? mapping.children[cursorArgumentName]
                        : undefined;
                    const constructor = childMapping ? childMapping.item : null;

                    if (constructor) {
                        value = constructor.fromNativeObject(value, childMapping);
                    }
                }

                return value;
            });

            const instance = new HydratedEntity(...constructorValues);

            // @todo apply setters that ar enot in the constructor

            return instance;
        };

        public readonly asNativeObject = () => {
            const keys = Object.keys(this);
            const values = Object.values(this);

            const out: Record<string, any> = {};

            keys.forEach((key, index) => {
                let value = values[index];

                if (key === '__isHydrated') {
                    return;
                }

                if (typeof value === 'function') {
                    return;
                }

                if (typeof value === 'object' && value.__isHydrated) {
                    value = value.asNativeObject();
                }

                const normalizedKey = key.replace(/^_/, '');

                out[normalizedKey] = value;
            });

            return out;
        };
    };
}

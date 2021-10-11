import 'reflect-metadata';

type Constructor<EntityType = {}> = {
    new (...args: any[]): EntityType;
    [key: string]: any;
};

export enum MappingStrategy {
    Stringify = 'stringify',
    ObjectProperties = 'objectProperties',
}

type ClassMapping<EntityType extends Record<string, any>> =
    | {
          strategy: MappingStrategy.Stringify;
      }
    | {
          strategy: MappingStrategy.ObjectProperties;
          properties: {
              [prop in keyof EntityType]: {
                  alternateName?: string;
                  inherit?: Constructor;
              };
          };
      };

export function serializable<EntityType extends Constructor>(mapping: ClassMapping<EntityType>) {
    return function (target: Constructor) {
        return class Serializable extends target {
            public readonly __className: string = target.name;

            static unserialize = (serialized: Record<string, any> | string) => {
                let instance: Serializable;

                if (mapping.strategy === MappingStrategy.Stringify) {
                    // @todo validate input is string!
                    // @todo check if static fromString() method exists first

                    if (typeof serialized !== 'string') {
                        throw new Error('Expecting serialized value to be of type string');
                    }

                    // this is an instance of the class that is wrapped by the decorator, not an
                    // instance of MappedEntity!
                    const childInstance = Serializable.fromString(serialized);

                    instance = new Serializable();

                    Object.keys(childInstance).forEach((key) => {
                        instance[key] = childInstance[key];
                    });
                } else {
                    instance = new Serializable();

                    const keys = Object.keys(mapping.properties) as Array<Extract<keyof EntityType, 'string'>>;

                    if (typeof serialized !== 'object') {
                        throw new Error('Expecting serialized value to be of type object');
                    }

                    keys.forEach((prop) => {
                        const propSettings = mapping.properties[prop];

                        const serializedKey: string = propSettings.alternateName || prop;

                        let value: any = serialized[serializedKey];

                        if (propSettings.inherit) {
                            const constructor = propSettings.inherit;

                            if (constructor.unserialize === undefined) {
                                throw new Error("Expecting static 'unserialize' method to be available on constructor");
                            }

                            value = constructor.unserialize(value, propSettings.inherit);
                        }

                        Reflect.set(instance, prop, value);
                    });
                }

                return instance;
            };

            // noinspection JSUnusedGlobalSymbols
            serialize = () => {
                if (mapping.strategy === MappingStrategy.Stringify) {
                    // @todo validate toString() method is available
                    return this.toString();
                }

                if (mapping.strategy === MappingStrategy.ObjectProperties) {
                    const out: Record<string, any> = {};

                    Object.keys(mapping.properties).forEach((prop) => {
                        const propSettings = mapping.properties[prop];

                        const key = propSettings.alternateName || prop;
                        let value: any;

                        if (propSettings.inherit) {
                            value = this[prop].serialize();
                        } else {
                            value = this[prop];
                        }

                        out[key] = value;
                    });

                    // @todo validate that there aren't any keys missing

                    return out;
                }

                throw new Error(`Strategy '${mapping.strategy}' not supported`);
            };
        };
    };
}

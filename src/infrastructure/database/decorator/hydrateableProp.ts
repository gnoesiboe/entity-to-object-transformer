export default function hydrateableProp(): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const type = Reflect.getMetadata('design:type', target, propertyKey);

        console.log('type', type);
    };
}

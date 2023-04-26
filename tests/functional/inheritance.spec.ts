import EntityToObjectTransformer, { ObjectMapping } from '../../src/transformer/EntityToObjectTransformer';
import Editor from '../support/entity/Editor';
import Uuid from '../support/valueObject/Uuid';
import UuidToStringTransformer from '../support/transformer/UuidToStringTransformer';

type AuthorAsObjectType = {
    _id: string;
    name: string;
    createdAt: string;
};

type EditorAsObjectType = AuthorAsObjectType & {
    alias: string;
};

describe('When applying inheritance', () => {
    describe('When transforming the entity to an object', () => {
        let transformer: EntityToObjectTransformer<Editor, EditorAsObjectType>;
        let editor: Editor;
        let editorAsObject: AuthorAsObjectType & { alias: string };

        beforeEach(() => {
            transformer = new EntityToObjectTransformer<Editor, EditorAsObjectType>({
                type: 'object',
                constructor: Editor,
                properties: {
                    uuid: {
                        type: 'property',
                        transformer: new UuidToStringTransformer(),
                    },
                    _name: {
                        type: 'property',
                        as: 'name',
                    },
                    _initials: {
                        type: 'property',
                        as: 'initials',
                    },
                    createdAt: {
                        type: 'property',
                    },
                    alias: {
                        type: 'property',
                    },
                },
            });

            editor = new Editor(new Uuid(), 'Eva Prong', 'evi');

            editorAsObject = transformer.transform(editor);
        });

        it('works as expected', () => {
            expect(editorAsObject).toEqual({
                uuid: editor.uuid.toString(),
                name: editor.name,
                initials: editor.initials,
                createdAt: editor.createdAt,
                alias: editor.alias,
            });
        });

        describe('and when transforming back', () => {
            it('becomes the same as the inputted entity', () => {
                const backAsEditor = transformer.reverseTransform(editorAsObject);

                expect(backAsEditor.uuid).toBeInstanceOf(Uuid);
                expect(backAsEditor.uuid.equals(editor.uuid)).toBe(true);
                expect(backAsEditor.name).toEqual(editor.name);
                expect(backAsEditor.createdAt).toEqual(editor.createdAt);
                expect(backAsEditor.alias).toEqual(editor.alias);
            });
        });
    });
});

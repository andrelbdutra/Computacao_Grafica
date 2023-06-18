import {basicSetup} from "codemirror";
import {EditorView, keymap} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {indentWithTab} from "@codemirror/commands";

const minHeightEditor = EditorView.theme({
    ".cm-content, .cm-gutter": {minHeight: "18vh"}
});

export function generateDefaultEditor(refElement)
{
    const editor = new EditorView({
        doc: 'Oi',
        //lineWrapping : true,
        extensions: [basicSetup, minHeightEditor,keymap.of([indentWithTab])],
        parent: refElement,
        extraKeys: {"Ctrl-Space": "autocomplete"}
    });

    return editor;
}

export const readOnlyState = EditorState.create({
    extensions: [basicSetup,EditorView.editable.of(false)]
});

export const editState = EditorState.create({
    extensions: [basicSetup,minHeightEditor,keymap.of([indentWithTab])]
});
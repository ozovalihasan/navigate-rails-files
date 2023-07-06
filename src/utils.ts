import { window, Range, Selection, Position, workspace, TextEditor } from 'vscode';
import {resolve} from "path";

export const changeToFileForModelFiles = async () => {
    const modelName = findModelName();
    if (!modelName) { 
        window.setStatusBarMessage("There is no a model name", 1000);
        return; 
    }
    const workspaceFolder = getWorkspaceFolder();

    await openDocument(workspaceFolder + "app/models/" + modelName + ".rb");
};

export const findModelName = () => {
    const editor = findEditor();
    if (!editor) { return; }
    
    const activeFileName = editor.document.fileName;

    const modelName = activeFileName.replace("_spec.rb", "")
                                    .replace(".rb", "")
                                    .replace(/.*\/(spec|app)\/models\//, "");
                                
    return modelName;
};

export const openDocument = async (filePath: string, callback: Function | null = null) => {
    const editor = findEditor();

    if (editor) {
        let activeFileName = editor.document.fileName;

        if (activeFileName === resolve(filePath)) {
            window.setStatusBarMessage("The requested page is already opened.", 1000);
        }
    }
    
    try {
        const document = await workspace.openTextDocument(filePath);
        await window.showTextDocument(document);
        if (callback) { callback(); }
    } catch (e) {
        window.setStatusBarMessage("The file couldn't be opened.", 1000);
    }
};

export const getWorkspaceFolder = () => {
    const activeFilePath = (window.activeTextEditor as TextEditor).document.uri.path;

    return (activeFilePath.match(/(.*\/)(app|spec)\/(models|views|controllers)/)?.slice(1)[0])
};

export const isViewRelatedFile = (fileName: string) : Boolean => (isViewFile(fileName) || isControllerFile(fileName));

export const isViewFile = (fileName: string) => (isHTMLViewFile(fileName) || isTurboStreamViewFile(fileName));

export const isControllerFile = (fileName: string) => Boolean(fileName.match(/app\/controllers\/.*_controller.rb/));

export const isHTMLViewFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/views\/.*\.html\.erb/));

export const isTurboStreamViewFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/views\/.*\.turbo_stream\.erb/));

export const isModelFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/models/));

export const moveCursorToStr = (str: string) => {
    const editor = findEditor();
    if (!editor) { return; }

    const document = editor.document;
    const wordPosition = document.positionAt(document.getText().indexOf(str));
    const newPosition = new Position(wordPosition.line, wordPosition.character + str.length);
    editor.selection = new Selection(newPosition, newPosition);
}

export const findEditor = (): TextEditor | undefined => {
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage('No active text editor');
      return;
    }

    return editor;
}

export const moveCursorToAction = (action: string) => {
    if (inActionBlock(action)) { return; }

    moveCursorToStr(`def ${action}`);
};

export const inActionBlock = (action: string) => {
    const editor = findEditor();
    if (!editor) { return; }

    const cursorPosition = editor.selection.active; 
    const fileTextToCursor = editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));

    if (fileTextToCursor.match(new RegExp("(\\s\*)def\\s*" + action + "\\s*\\n(.*\\n)*" + "\\1end"))) { return false;}
    if (fileTextToCursor.match(new RegExp("(\\s\*)def\\s*" + action + "\\s*;\\s*end"))) { return false;}
    if (fileTextToCursor.match(new RegExp("(\\s\*)def\\s*" + action))) { return true;}
    
    return false;
};

export const findActionAndController = () => {
    const editor = window.activeTextEditor;

    if (editor) {
        let activeFileName = editor.document.fileName;

        let folderOfController = activeFileName.replace(/(spec|app)\/(views|controllers)/, "app/views")
                                                    .replace(".turbo_stream.erb_spec.rb", "")
                                                    .replace(".html.erb_spec.rb", "")
                                                    .replace(".turbo_stream.erb", "")
                                                    .replace(".html.erb", "")
                                                    .replace("_controller.rb", "")
                                                    .replace(".rb", "");

        let action = "";
        let controller = "";

        if ( isControllerFile(activeFileName) ) {
            const cursorPosition = editor.selection.active; 
            const fileTextToCursor = editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));
            
            [ action ] = fileTextToCursor.match(/def\s*\w+/g)?.slice(-1) || [ "" ];
            action = action.replace(/def\s*/, "");
            
            [ controller ] = folderOfController.match(/app\/views\/(.*)$/)?.slice(-1) || [ "" ];
            
        } else if ( isViewFile(activeFileName) ) {
            [controller, action] = folderOfController.match(/app\/views\/(.*)\/(\w+)$/)?.slice(-2) || [ "", "" ];
        } else {
            window.setStatusBarMessage('There is no an action or a controller.', 1000);    
            return ["", ""];
        }
        
        return [controller, action];
    } else {
        window.setStatusBarMessage('There is no an editor to select.', 1000);    
        return ["", ""];
    }
    
};

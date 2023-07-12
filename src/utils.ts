import { window, Range, Selection, Position, workspace, TextEditor, Uri } from 'vscode';
import {resolve} from "path";
import * as fs from 'fs'; // In NodeJS: 'const fs = require('fs')'

export const changeToFileForModelFiles = async (folderName: "app" | "spec") => {
    const modelName = findModelName();
    if (!modelName) { 
        window.setStatusBarMessage("There is no a model name", 1000);
        return; 
    }
    const projectRoot = getProjectRoot();
    
    await openDocument(projectRoot + folderName + "/models/" + modelName + (folderName === "app" ? ".rb" : "_spec.rb"));
};

export const changeToFileForControllerFiles = async () => {
    let [controller, action] = findActionAndController();
	
    const workspaceFolder = getProjectRoot();

    await openDocument(workspaceFolder + "app/controllers/" + controller + "_controller.rb", () => moveCursorToAction(action));
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
    const isFileExist = checkFileExists(filePath)
    if (!isFileExist) {
        window.setStatusBarMessage(`Your file(${filePath}) doesn't exist.`, 1000);    
        return;
    }
    
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

export const getProjectRoot = () => {
    const activeFilePath = (window.activeTextEditor as TextEditor).document.uri.path;

    return (activeFilePath.match(/(.*\/)(app|spec)\/(models|views|controllers)/)?.slice(1)[0])
};

export const isViewRelatedFile = (fileName: string) : Boolean => (isViewFile(fileName) || isControllerFile(fileName));

export const isViewFile = (fileName: string) => (isHTMLViewFile(fileName) || isTurboStreamViewFile(fileName));

export const isControllerFile = (fileName: string) => Boolean(fileName.match(/app\/controllers\/.*_controller.rb/));

export const isHTMLViewFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/views\/.*\.html\.(erb|slim|haml)/));

export const isTurboStreamViewFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/views\/.*\.turbo_stream\.(erb|slim|haml)/));

export const isModelFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/models/));

export const isTestFile = (fileName: string) => Boolean(fileName.match(/spec\/.*_spec.rb/));

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

export const getTextUntilCursor = () => {
    const editor = findEditor();
    if (!editor) { return ""; }

    const cursorPosition = editor.selection.active; 
    return editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));
}

export const inActionBlock = (action: string) => {
    const editor = findEditor();
    if (!editor) { return; }

    const fileTextToCursor = getTextUntilCursor();

    if (fileTextToCursor.match(new RegExp("(\\s\*)def\\s*" + action + "\\s*\\n(.*\\n)*" + "\\1end"))) { return false;}
    if (fileTextToCursor.match(new RegExp("(\\s\*)def\\s*" + action + "\\s*;\\s*end"))) { return false;}
    if (fileTextToCursor.match(new RegExp("(\\s\*)def\\s*" + action))) { return true;}
    
    return false;
};

export const findActionAndController = () => {
    const editor = window.activeTextEditor;

    if (editor) {
        let activeFileName = editor.document.fileName;
        
        let action = "";
        let controller = "";

        if ( isControllerFile(activeFileName) ) {
            const fileTextToCursor = getTextUntilCursor();
            
            [ action ] = fileTextToCursor.match(/def\s*(\w+)(?!.*def\s*\w+)/s)?.slice(1) || [ "" ];

            [ controller ] = activeFileName.match(/app\/controllers\/(.*)_controller.rb$/)?.slice(-1) || [ "" ];
            
        } else if ( isViewFile(activeFileName) ) {
            [controller, action] = activeFileName.match(/(app|spec)\/views\/(.*)\/(\w+)\.(turbo_stream|html)\.(erb|slim|haml)(_spec\.rb)*/)?.splice(2,2) || [ "", "" ];
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

export const changeToFileForViewFiles = async (folderName: "app" | "spec", fileExtension: "html" | "turbo_stream") => {
    let [controller, action] = findActionAndController()

    const projectRoot = getProjectRoot();

    const templateEngines : string[] = workspace.getConfiguration('navigate-rails-files').get("template-engines") as string[];

    let fullPath : string | null = null;
    let setFullPath = (template_engine: string) => projectRoot + folderName + "/views/" + controller + "/" + action + "." + fileExtension + "." + template_engine + (folderName === "spec" ? "_spec.rb" : "");
    
    for (let template_engine of templateEngines) {
        fullPath = setFullPath(template_engine);
        
        if (fileExtension === "html") {
        
            const isFileExist = checkFileExists(fullPath);
            if (!isFileExist) {
                fullPath = fullPath.replace("html", "turbo_stream")
            };
        };
        
        if ( checkFileExists(fullPath) ) {
            await openDocument(fullPath);
            return;
        }

    };

    window.setStatusBarMessage("Any valid view file couldn't be found.", 1000);
}

export const checkFileExists = (filePath: string): boolean => {
    return fs.existsSync(filePath)
}
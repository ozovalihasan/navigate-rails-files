// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, Range, Selection, Position, workspace, TextEditor, ExtensionContext } from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	context.subscriptions.push(
		commands.registerCommand('navigate-rails-files.open-rb-file', () => {
			const editor = window.activeTextEditor;
	
			if (editor) {
				let activeFileName = editor.document.fileName;
				if ( isViewRelatedFile(activeFileName) ) {
					
					let [controller, action] = findActionAndController();
	
					const workspaceFolder = getWorkspaceFolder();
	
					openDocument(workspaceFolder + "app/controllers/" + controller + "_controller.rb", () => moveCursorToAction(action));
	
				} else if ( isModelFile(activeFileName) ) {
					
					changeToFileForModelFiles(editor, "app/models", ".rb");    
					
				} else {
					
					window.setStatusBarMessage("Your file is not suitable to toggle", 1000);
	
				}
			}
		})
	
	);
}

const changeToFileForModelFiles = (editor: TextEditor, folderName: string, fileExtension: string) => {
    const modelName = findModelName(editor);

    const workspaceFolder = getWorkspaceFolder();

    openDocument(workspaceFolder + folderName + "/" + modelName + fileExtension);
};

const findModelName = (editor: TextEditor) => {
    const activeFileName = editor.document.fileName;

    const modelName = activeFileName.replace("_spec.rb", "")
                                    .replace(".rb", "")
                                    .replace(/.*\/(spec|app)\/models\//, "");
                            
                                
    return modelName;
};

const openDocument = async (filePath: string, callback: Function | null = null) => {
    const editor = window.activeTextEditor;

    if (editor) {
        let activeFileName = editor.document.fileName;

        if (activeFileName === filePath) {
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

const getWorkspaceFolder = () => {
    const editor = window.activeTextEditor;

    if (editor) {
        let activeFileName = editor.document.fileName;
        const workspaceFolder = activeFileName.match(/(.*\/)(app|spec)\/(models|views|controllers)/)?.slice(1)[0] || "";

        if (workspaceFolder === "") {
            window.setStatusBarMessage("There is no a workspace folder", 1000);
            return;
        }

        return workspaceFolder;
    } else {
        window.setStatusBarMessage('There is no an editor to select.', 1000);    
    }
};

const isViewRelatedFile = (fileName: string) : Boolean => (isViewFile(fileName) || isControllerFile(fileName));

const isViewFile = (fileName: string) => (isHTMLViewFile(fileName) || isTurboStreamViewFile(fileName));

const isControllerFile = (fileName: string) => Boolean(fileName.match(/app\/controllers/));

const isHTMLViewFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/views\/.*\.html\.erb/));

const isTurboStreamViewFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/views\/.*\.turbo_stream\.erb/));

const isModelFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/models/));

const  moveCursorToAction = (action: string) => {
    const editor = window.activeTextEditor;
    if (!editor) {
      window.showErrorMessage('No active text editor');
      return;
    }

    if (checkingAction(action)) { return; }

    const actionDefinition = `def ${action}`;
    
    const document = editor.document;
    const wordPosition = document.positionAt(document.getText().indexOf(actionDefinition));
    const newPosition = new Position(wordPosition.line, wordPosition.character + actionDefinition.length);
    
    editor.edit(editBuilder => {
      editBuilder.insert(newPosition, '');
    }).then(() => {
      editor.selection = new Selection(newPosition, newPosition);
    });
};

const checkingAction = (action: string) => {
    const editor = window.activeTextEditor;
    
    if (!editor) {
        window.showErrorMessage('No active text editor');
        return;
    }

    const cursorPosition = editor.selection.active; 
    const fileTextToCursor = editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));

    if (fileTextToCursor.match(new RegExp("(\\s\*)def\\s*" + action + "\\s*\\n(.*\\n)*" + "\\1end"))) { return false;}
    if (fileTextToCursor.match(new RegExp("(\\s\*)def\\s*" + action + "\\s*;\\s*end"))) { return false;}
    if (fileTextToCursor.match(new RegExp("(\\s\*)def\\s*" + action))) { return true;}
    
    return false;
};

const findActionAndController = () => {
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

// This method is called when your extension is deactivated
export function deactivate() {}

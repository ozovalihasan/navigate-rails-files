// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext } from 'vscode';
import { changeToFileForModelFiles, findActionAndController, getWorkspaceFolder, isModelFile, isViewRelatedFile, openDocument } from './utils';
import * as utils from "./utils"

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	context.subscriptions.push(
		commands.registerCommand('navigate-rails-files.open-rb-file',async () => {
			const editor = window.activeTextEditor;
	
			if (editor) {
				let activeFileName = editor.document.fileName;
				if ( isViewRelatedFile(activeFileName) ) {
					let [controller, action] = findActionAndController();
	
					const workspaceFolder = getWorkspaceFolder();
	
					await utils.openDocument(workspaceFolder + "app/controllers/" + controller + "_controller.rb", () => utils.moveCursorToAction(action));
	
				} else if ( isModelFile(activeFileName) ) {
                    
					await changeToFileForModelFiles();    
					
				} else {
					
					window.setStatusBarMessage("Your file is not suitable to toggle", 1000);
	
				}
			}
		})
	
	);
}

// This method is called when your extension is deactivated
function deactivate() {}

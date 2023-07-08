// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext } from 'vscode';
import { 
	changeToFileForModelFiles, 
	isModelFile, 
	isViewRelatedFile ,
	changeToFileForViewFiles,
	findEditor,
	changeToFileForControllerFiles,
	isTurboStreamViewFile
} from './utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	context.subscriptions.push(
		commands.registerCommand('navigate-rails-files.open-rb-file',async () => {
			const editor = findEditor();
	
			if (editor) {
				let activeFileName = editor.document.fileName;

				if ( isViewRelatedFile(activeFileName) ) {
					await changeToFileForControllerFiles()
	
				} else if ( isModelFile(activeFileName) ) {
                    
					await changeToFileForModelFiles("app/models/", ".rb");    
					
				} else {
					
					window.setStatusBarMessage("Your file is not suitable to toggle", 1000);
	
				}
			}
		})
	
	);

	context.subscriptions.push(

		commands.registerCommand('navigate-rails-files.change-to-app-html-file', async () => {
			const editor = findEditor();
	
			if (editor) {
				let activeFileName = editor.document.fileName
	
				if ( isViewRelatedFile(activeFileName) ) {
					await changeToFileForViewFiles("app", "html")
				} else {
					window.setStatusBarMessage("Your file isn't suitable to be opened with an file extension 'html.erb' ", 1000);
				}
			}
		})
	);

	context.subscriptions.push(

		commands.registerCommand('navigate-rails-files.change-to-app-turbo-stream-file', async () => {
			const editor = findEditor();
	
			if (editor) {
				let activeFileName = editor.document.fileName
	
				if ( isViewRelatedFile(activeFileName) ) {
					await changeToFileForViewFiles("app", "turbo_stream")
				} else {
					window.setStatusBarMessage("Your file isn't suitable to be opened with an file extension 'turbo_stream.erb' ", 1000);
				}
			}
		})
	);

	context.subscriptions.push(

		commands.registerCommand('navigate-rails-files.change-to-rspec-file', async () => {
			const editor = window.activeTextEditor;

			if (editor) {
				let activeFileName = editor.document.fileName

				if ( isViewRelatedFile(activeFileName) ) {

					if (isTurboStreamViewFile(activeFileName)){
						await changeToFileForViewFiles("spec", "turbo_stream")    
					} else {
						await changeToFileForViewFiles("spec", "html")    
					}
					
				} else if ( isModelFile(activeFileName) ) {
					
					await changeToFileForModelFiles("spec/models", "_spec.rb")    
					
				} else {
					
					window.setStatusBarMessage("Your file isn't suitable to be opened with an file ending '_spec.rb' ", 1000);

				}
			}
			
		})
	);
}

// This method is called when your extension is deactivated
function deactivate() {}

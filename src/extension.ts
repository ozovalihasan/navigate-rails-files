// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext } from 'vscode';
import { 
	findEditor,
} from './utils';
import { PairsType, htmlPairs, rbPairs, rspecPairs, turboStreamPairs } from './filePairs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export const navigateToFile = async (pairs: PairsType) => {
	const editor = findEditor();

	if (editor) {
		let activeFileName = editor.document.fileName;

		for (let pair of pairs) {
			if (pair.checkFunction(activeFileName)) {
				await pair.callback();
				return;
			}
		}
		
		window.setStatusBarMessage("Your file is not suitable to navigate", 1000);
	}
};

export function activate(context: ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	context.subscriptions.push(
		commands.registerCommand('navigateRailsFiles.openRbFile', async () => await navigateToFile(rbPairs))
	
	);

	context.subscriptions.push(
		commands.registerCommand('navigateRailsFiles.changeToAppHtmlFile', async () => await navigateToFile(htmlPairs))
	);

	context.subscriptions.push(

		commands.registerCommand('navigateRailsFiles.changeToAppTurboStreamFile', async () => await navigateToFile(turboStreamPairs))
	);

	context.subscriptions.push(
		commands.registerCommand('navigateRailsFiles.changeToRspecFile', async () => await navigateToFile(rspecPairs))
	);
}

// This method is called when your extension is deactivated
function deactivate() {}

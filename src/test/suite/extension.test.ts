// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { window, commands, Uri, workspace } from 'vscode';
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as utils from '../../utils';
import * as path from 'path'
import { afterEach, beforeEach } from 'mocha';


const testFolderLocation = "/../../../src/test/suite/example"

const openFileForTests = async(filePath: string = '/app/controllers/products_controller.rb') => {
	const uri = Uri.file(
		path.join(__dirname + testFolderLocation + filePath)
	)
	
	const document = await workspace.openTextDocument(uri)
	await window.showTextDocument(document)
	
}

const fullPath = (filePath: string) => (path.resolve(__dirname + testFolderLocation + filePath))

suite('Extension Test Suite', () => {
	beforeEach(() => {
        commands.executeCommand('workbench.action.closeActiveEditor')

    });

	afterEach(() => {
        commands.executeCommand('workbench.action.closeActiveEditor')
		sinon.restore();
    });

	
	window.showInformationMessage('Start all tests.');

	suite('Test "navigate-rails-files.open-rb-file" command', () => {
		suite("for view related files", () => {
			test('if a view file is opened', async () => {
				await openFileForTests('/app/views/products/index.html.erb');
		
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPath("/app/controllers/products_controller.rb"))
				expect(utils.inActionBlock("index")).to.be.true
			});
			
			test('if a controller file is opened', async () => {
				await openFileForTests('/app/controllers/products_controller.rb');
				utils.moveCursorToStr('A point below the action "index"');
	
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPath("/app/controllers/products_controller.rb"))
				expect(utils.inActionBlock("index")).to.be.true
			});
	
			test('if a view test file is opened', async () => {
				await openFileForTests('/spec/views/products/index.html.erb_spec.rb');
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPath("/app/controllers/products_controller.rb"))
				expect(utils.inActionBlock("index")).to.be.true
			});
		})
		
		suite("for model related files", () => {
			test('if a model file is opened', async () => {
				await openFileForTests('/app/models/product.rb');
				const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");
	
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPath("/app/models/product.rb"))
				expect(statusBarMessage.called).to.be.true
			});
	
			test('if a model test file is opened', async () => {
				await openFileForTests('/spec/models/product_spec.rb');
	
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPath("/app/models/product.rb"))
			});
		})
	})

	
	

});

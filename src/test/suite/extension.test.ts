// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { window, commands, Uri, workspace, Range, TextEditor } from 'vscode';
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as navigateRailsFiles from '../../extension';
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
				
				let editor = navigateRailsFiles.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(path.resolve(__dirname + testFolderLocation + "/app/controllers/products_controller.rb"))
				expect(navigateRailsFiles.inActionBlock("index")).to.be.true
			});
			
			test('if a controller file is opened', async () => {
				await openFileForTests('/app/controllers/products_controller.rb');
				navigateRailsFiles.moveCursorToStr('A point below the action "index"');
	
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = navigateRailsFiles.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(path.resolve(__dirname + testFolderLocation + "/app/controllers/products_controller.rb"))
				expect(navigateRailsFiles.inActionBlock("index")).to.be.true
			});
	
			test('if a view test file is opened', async () => {
				await openFileForTests('/spec/views/products/index.html.erb_spec.rb');
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = navigateRailsFiles.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(path.resolve(__dirname + testFolderLocation + "/app/controllers/products_controller.rb"))
				expect(navigateRailsFiles.inActionBlock("index")).to.be.true
			});
		})
		
		suite("for model related files", () => {
			test('if a model file is opened', async () => {
				await openFileForTests('/app/models/product.rb');
				const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");
	
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = navigateRailsFiles.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(path.resolve(__dirname + testFolderLocation + "/app/models/product.rb"))
				expect(statusBarMessage.called).to.be.true
			});
	
			test('if a model test file is opened', async () => {
				await openFileForTests('/spec/models/product_spec.rb');
	
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = navigateRailsFiles.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(path.resolve(__dirname + testFolderLocation + "/app/models/product.rb"))
			});
		})
	})

	test('Test isViewRelatedFile function', () => {
		expect(navigateRailsFiles.isViewRelatedFile('app/views/test.html.erb')).to.be.true
		expect(navigateRailsFiles.isViewRelatedFile('app/controllers/test_controller.rb')).to.be.true
		expect(navigateRailsFiles.isViewRelatedFile('app/models/test.rb')).to.be.false
	});

	test('Test isViewFile function', () => {
		expect(navigateRailsFiles.isViewFile('app/views/test.html.erb')).to.be.true
		expect(navigateRailsFiles.isViewFile('app/views/test.turbo_stream.erb')).to.be.true
		expect(navigateRailsFiles.isViewFile('app/views/test.rb')).to.be.false
	});

	test('Test isControllerFile function', () => {
		expect(navigateRailsFiles.isControllerFile('app/controllers/test_controller.rb')).to.be.true
		expect(navigateRailsFiles.isControllerFile('app/controllers/test.rb')).to.be.false
	});

	test('Test isHTMLViewFile function', () => {
		expect(navigateRailsFiles.isHTMLViewFile('app/views/test.html.erb')).to.be.true
		expect(navigateRailsFiles.isHTMLViewFile('app/views/test.turbo_stream.erb')).to.be.false
		expect(navigateRailsFiles.isHTMLViewFile('app/views/test.rb')).to.be.false
	});

	test('Test isTurboStreamViewFile function', () => {
		expect(navigateRailsFiles.isTurboStreamViewFile('app/views/test.html.erb')).to.be.false
		expect(navigateRailsFiles.isTurboStreamViewFile('app/views/test.turbo_stream.erb')).to.be.true
		expect(navigateRailsFiles.isTurboStreamViewFile('app/views/test.rb')).to.be.false
	});

	test('Test isModelFile function', () => {
		expect(navigateRailsFiles.isModelFile('app/models/test.rb')).to.be.true
		expect(navigateRailsFiles.isModelFile('app/models/test_spec.rb')).to.be.true
		expect(navigateRailsFiles.isModelFile('app/views/test.html.erb')).to.be.false
	});

	suite("Test findActionAndController function", () => {
		test('for a view', async () => {
			await openFileForTests('/app/views/products/index.html.erb')
		
			const [controller, action] = navigateRailsFiles.findActionAndController();
			expect(controller).to.be.equal('products')
			expect(action).to.be.equal('index')
		});
	
		test('for a controller', async () => {
			await openFileForTests('/app/controllers/products_controller.rb')
	
			let controller : string = "";
			let action : string = "";
			
			navigateRailsFiles.moveCursorToStr('A point above the action "index"');
			[controller, action] = navigateRailsFiles.findActionAndController();
			expect(controller).to.be.equal('products')
			expect(action).to.be.equal('')
	
			navigateRailsFiles.moveCursorToStr('A point in the action "index"');
			[controller, action] = navigateRailsFiles.findActionAndController();
			expect(controller).to.be.equal('products')
			expect(action).to.be.equal('index')
	
			navigateRailsFiles.moveCursorToStr('A point below the action "index"');
			[controller, action] = navigateRailsFiles.findActionAndController();
			expect(controller).to.be.equal('products')
			expect(action).to.be.equal('index')
		});
	})
	
	
	test('Test findEditor function', async () => {
		await openFileForTests('/app/controllers/products_controller.rb')
		
		let editor = navigateRailsFiles.findEditor();
		expect(editor).to.be.ok
	});

	suite('Test findModelName function', () => {
		test('for model file', async () => {
			await openFileForTests('/app/models/product.rb')
	
			expect(navigateRailsFiles.findModelName()).to.be.equal("product")
		});
	
		test('for test file', async () => {
			await openFileForTests('/spec/models/product_spec.rb')
	
			expect(navigateRailsFiles.findModelName()).to.be.equal("product")
		});
	})

	test('Test inActionBlock function', async () => {
		await openFileForTests('/app/controllers/products_controller.rb')

		navigateRailsFiles.moveCursorToStr('A point above the action "index"');
		expect(navigateRailsFiles.inActionBlock("index")).to.be.false

		navigateRailsFiles.moveCursorToStr('A point in the action "index"');
		expect(navigateRailsFiles.inActionBlock("index")).to.be.true

		navigateRailsFiles.moveCursorToStr('A point below the action "index"');
		expect(navigateRailsFiles.inActionBlock("index")).to.be.false
		
		navigateRailsFiles.moveCursorToStr('A point below the action "show"');
		expect(navigateRailsFiles.inActionBlock("show")).to.be.false
	});

	test('Test moveCursorToStr function', async () => {
		await openFileForTests('/app/controllers/products_controller.rb')

		const editor = navigateRailsFiles.findEditor();
		if (!editor) { return; }

		navigateRailsFiles.moveCursorToStr('ProductsController');
		let cursorPosition = editor.selection.active; 
		let fileTextToCursor = editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));

		expect(fileTextToCursor.endsWith('ProductsController')).to.be.true

		navigateRailsFiles.moveCursorToStr('A point above the action "index"');
		cursorPosition = editor.selection.active; 
		fileTextToCursor = editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));

		expect(fileTextToCursor.endsWith('A point above the action "index"')).to.be.true
	});

	suite('Test moveCursorToAction function', () => {
		test('if cursor is in the action block', () => {
			const inActionBlock = sinon.stub(navigateRailsFiles, "inActionBlock").returns(true);
			const moveCursorToStr = sinon.stub(navigateRailsFiles, "moveCursorToStr");
	
			navigateRailsFiles.moveCursorToAction("mock_action")
			expect(inActionBlock.calledOnce).to.be.true;
			expect(moveCursorToStr.called).to.be.false;
		});
	
		test('if cursor is not in the action block', () => {
			const inActionBlock = sinon.stub(navigateRailsFiles, "inActionBlock").returns(false);
			const moveCursorToStr = sinon.stub(navigateRailsFiles, "moveCursorToStr");
	
			navigateRailsFiles.moveCursorToAction("mock_action")
			expect(inActionBlock.calledOnce).to.be.true;
			expect(moveCursorToStr.calledWith("def mock_action")).to.be.true;
		});
	
	})
	
	test('Test getWorkspaceFolder function', () => {
		sinon.stub((window.activeTextEditor as TextEditor).document.uri, "path").value("mock_workspace_folder/app/controllers/product_conroller.rb");

		navigateRailsFiles.getWorkspaceFolder()
		expect(navigateRailsFiles.getWorkspaceFolder()).to.equal("mock_workspace_folder/");
	});

	suite('Test openDocument function ', () => {
		test('for an invalid document', async () => {
			const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");
	
			await navigateRailsFiles.openDocument(__dirname + testFolderLocation + "/invalid_document_name");
			expect(statusBarMessage.calledOnce).to.be.true;
		});
		
		test('for a document already opened', async () => {
			const filePath = '/app/controllers/products_controller.rb'
			await openFileForTests(filePath)
	
			const editor = navigateRailsFiles.findEditor();
			if (!editor) { return; }
			
			const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
	
			await navigateRailsFiles.openDocument(__dirname + testFolderLocation + filePath);
			expect(statusBarMessage.calledOnce).to.be.true;
		});
		
		test('for a document', async () => {
			const filePath = '/app/models/product.rb'
			const spy = sinon.spy();
	
			await navigateRailsFiles.openDocument(__dirname + testFolderLocation + filePath, spy);
			expect(spy.calledOnce).to.be.true;
		});
	})

	suite('Test changeToFileForModelFiles function', () => {
		test('if a model exists', async () => {
			sinon.stub(navigateRailsFiles, "findModelName").returns("product");
			const openDocument = sinon.stub(navigateRailsFiles, "openDocument");
	
			await navigateRailsFiles.changeToFileForModelFiles();
			expect(openDocument.called).to.be.true;
		});
	
		test("if a model doesn't exist", async () => {
			sinon.stub(navigateRailsFiles, "findModelName");
			const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");
	
			await navigateRailsFiles.changeToFileForModelFiles();
			expect(statusBarMessage.called).to.be.true;
		});
	})
	

});

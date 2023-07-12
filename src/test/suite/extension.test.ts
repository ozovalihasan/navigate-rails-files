// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { window, commands, Uri, workspace } from 'vscode';
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as utils from '../../utils';
import * as path from 'path';
import { afterEach, beforeEach } from 'mocha';


const testFolderLocation = "/../../../src/test/suite/example";

const openFileForTests = async(filePath: string = '/app/controllers/products_controller.rb') => {
	const uri = Uri.file(
		path.join(__dirname + testFolderLocation + filePath)
	);
	
	const document = await workspace.openTextDocument(uri);
	await window.showTextDocument(document);
	
};

const fullPathForTests = (filePath: string) => (path.resolve(__dirname + testFolderLocation + filePath));

suite('Extension Test Suite', () => {
	beforeEach(() => {
        commands.executeCommand('workbench.action.closeActiveEditor');

    });

	afterEach(() => {
        commands.executeCommand('workbench.action.closeActiveEditor');
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
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/controllers/products_controller.rb"));
				expect(utils.inActionBlock("index")).to.be.true;
			});
			
			test('if a controller file is opened', async () => {
				await openFileForTests('/app/controllers/products_controller.rb');
				utils.moveCursorToStr('A point below the action "index"');
	
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/controllers/products_controller.rb"));
				expect(utils.inActionBlock("index")).to.be.true;
			});
	
			test('if a view test file is opened', async () => {
				await openFileForTests('/spec/views/products/index.html.erb_spec.rb');
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/controllers/products_controller.rb"));
				expect(utils.inActionBlock("index")).to.be.true;
			});
		});
		
		suite("for model related files", () => {
			test('if a model file is opened', async () => {
				await openFileForTests('/app/models/product.rb');
				const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");
	
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/models/product.rb"));
				expect(statusBarMessage.called).to.be.true;
			});
	
			test('if a model test file is opened', async () => {
				await openFileForTests('/spec/models/product_spec.rb');
	
				await commands.executeCommand('navigate-rails-files.open-rb-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/models/product.rb"));
			});
		});
	});

	suite('Test "navigate-rails-files.change-to-app-html-file" command', () => {
		suite("for views", () => {
			test('if a app/html file is opened', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				
				await openFileForTests('/app/views/products/index.html.erb');
				
				await commands.executeCommand('navigate-rails-files.change-to-app-html-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/index.html.erb"));
				expect(statusBarMessage.called).to.be.true;
			});

			test('if a app/turbo_stream file is opened', async () => {
				await openFileForTests('/app/views/products/index.turbo_stream.erb');
				
				await commands.executeCommand('navigate-rails-files.change-to-app-html-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/index.html.erb"));
			});

			test('if a app/turbo_stream file is opened and there is no an action.html.erb file', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				await openFileForTests('/app/views/products/show.turbo_stream.erb');
				
				await commands.executeCommand('navigate-rails-files.change-to-app-html-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/show.turbo_stream.erb"));
				expect(statusBarMessage.called).to.be.true;
			});
		});
			
		suite('for controllers', async () => {
			test('if there is a html.erb of the action', async () => {
				await openFileForTests('/app/controllers/products_controller.rb');
				utils.moveCursorToStr('A point in the action "index"');

				await commands.executeCommand('navigate-rails-files.change-to-app-html-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/index.html.erb"));
			});

			test('if there is no a html.erb of the action', async () => {
				await openFileForTests('/app/controllers/products_controller.rb');
				utils.moveCursorToStr('A point in the action "create"');

				await commands.executeCommand('navigate-rails-files.change-to-app-html-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/create.turbo_stream.erb"));
			});
		});

		suite("for test files", () => {
			test('if a html.erb_spec.rb file is opened', async () => {
				await openFileForTests('/spec/views/products/index.html.erb_spec.rb');
				
	
				await commands.executeCommand('navigate-rails-files.change-to-app-html-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/index.html.erb"));
			});

			test('if a turbo_stream.erb_spec.rb file is opened', async () => {
				await openFileForTests('/spec/views/products/index.turbo_stream.erb_spec.rb');
	
				await commands.executeCommand('navigate-rails-files.change-to-app-html-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/index.html.erb"));
			});
			
			test('if a turbo_stream.erb_spec.rb file is opened and there is no an action.html.erb file', async () => {
				await openFileForTests('/spec/views/products/show.turbo_stream.erb_spec.rb');
	
				await commands.executeCommand('navigate-rails-files.change-to-app-html-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/show.turbo_stream.erb"));
			});
	
		});

		test('for unsuitable file', async () => {
			const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
			await openFileForTests('/app/models/product.rb');
			
			await commands.executeCommand('navigate-rails-files.change-to-app-html-file');
			
			let editor = utils.findEditor();
			if (!editor) { return; }
	
			expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/models/product.rb"));
			expect(statusBarMessage.called).to.be.true;
		});
	});

	suite('Test "navigate-rails-files.change-to-app-turbo-stream-file" command', () => {
		suite("for views", () => {
			test('if a app/turbo_stream file is opened', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				
				await openFileForTests('/app/views/products/index.turbo_stream.erb');
				
				await commands.executeCommand('navigate-rails-files.change-to-app-turbo-stream-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/index.turbo_stream.erb"));
				expect(statusBarMessage.called).to.be.true;
			});

			test('if a app/html file is opened and there is no an action.turbo_stream.erb file', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				await openFileForTests('/app/views/products/edit.html.erb');
				
				await commands.executeCommand('navigate-rails-files.change-to-app-turbo-stream-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/edit.html.erb"));
				expect(statusBarMessage.called).to.be.true;
			});
		});
			
		suite('for controllers', async () => {
			test('if there is a turbo_stream.erb file of the action', async () => {
				await openFileForTests('/app/controllers/products_controller.rb');
				utils.moveCursorToStr('A point in the action "index"');

				await commands.executeCommand('navigate-rails-files.change-to-app-turbo-stream-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/index.turbo_stream.erb"));
			});

			test('if there is no a turbo_stream.erb file of the action', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				
				await openFileForTests('/app/controllers/products_controller.rb');
				utils.moveCursorToStr('A point in the action "edit"');

				await commands.executeCommand('navigate-rails-files.change-to-app-turbo-stream-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests('/app/controllers/products_controller.rb'));
				expect(statusBarMessage.called).to.be.true;
			});
		});

		suite("for test files", () => {
			test('if a html.erb_spec.rb file is opened', async () => {
				await openFileForTests('/spec/views/products/index.html.erb_spec.rb');
				
	
				await commands.executeCommand('navigate-rails-files.change-to-app-turbo-stream-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/index.turbo_stream.erb"));
			});

			test('if a turbo_stream.erb_spec.rb file is opened', async () => {
				await openFileForTests('/spec/views/products/index.turbo_stream.erb_spec.rb');
	
				await commands.executeCommand('navigate-rails-files.change-to-app-turbo-stream-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/views/products/index.turbo_stream.erb"));
			});
			
			test('if a html.erb_spec.rb file is opened and there is no an action.turbo_stream.erb file', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				
				await openFileForTests('/spec/views/products/edit.html.erb_spec.rb');
	
				await commands.executeCommand('navigate-rails-files.change-to-app-turbo-stream-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests('/spec/views/products/edit.html.erb_spec.rb'));
				expect(statusBarMessage.called).to.be.true;
			});
	
		});

		test('for unsuitable file', async () => {
			const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
			await openFileForTests('/app/models/product.rb');
			
			await commands.executeCommand('navigate-rails-files.change-to-app-turbo-stream-file');
			
			let editor = utils.findEditor();
			if (!editor) { return; }
	
			expect(editor.document.fileName).to.be.equal(fullPathForTests("/app/models/product.rb"));
			expect(statusBarMessage.called).to.be.true;
		});
	});

	suite('Test "navigate-rails-files.change-to-rspec-file" command', () => {
		suite("for views", () => {
			test('if a spec/html file is opened', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				
				await openFileForTests('/spec/views/products/index.html.erb_spec.rb');
				
				await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/spec/views/products/index.html.erb_spec.rb"));
				expect(statusBarMessage.called).to.be.true;
			});

			test('if a spec/turbo_stream file is opened', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				
				await openFileForTests('/spec/views/products/index.turbo_stream.erb_spec.rb');
				
				await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/spec/views/products/index.turbo_stream.erb_spec.rb"));
				expect(statusBarMessage.called).to.be.true;
			});

			test('if a app/html file is opened', async () => {
				await openFileForTests('/app/views/products/index.html.erb');
				
				await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/spec/views/products/index.html.erb_spec.rb"));
			});

			test('if a app/turbo_stream file is opened', async () => {
				await openFileForTests('/app/views/products/index.turbo_stream.erb');
				
				await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/spec/views/products/index.turbo_stream.erb_spec.rb"));
			});
		});
			
		suite('for controllers', async () => {
			test('if there is a html.erb_spec.rb file of the action', async () => {
				await openFileForTests('/app/controllers/products_controller.rb');
				utils.moveCursorToStr('A point in the action "index"');

				await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/spec/views/products/index.html.erb_spec.rb"));
			});

			test('if there is no a html.erb_spec.rb file of the action', async () => {
				await openFileForTests('/app/controllers/products_controller.rb');
				utils.moveCursorToStr('A point in the action "create"');

				await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests('/spec/views/products/create.turbo_stream.erb_spec.rb'));
			});
		});

		suite("for test files", () => {
			test('if a html.erb_spec.rb file is opened', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				await openFileForTests('/spec/views/products/index.html.erb_spec.rb');
	
				await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/spec/views/products/index.html.erb_spec.rb"));
				expect(statusBarMessage.called).to.be.true;
			});

			test('if a turbo_stream.erb_spec.rb file is opened', async () => {
				const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
				await openFileForTests('/spec/views/products/index.turbo_stream.erb_spec.rb');
	
				await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
				
				let editor = utils.findEditor();
				if (!editor) { return; }
		
				expect(editor.document.fileName).to.be.equal(fullPathForTests("/spec/views/products/index.turbo_stream.erb_spec.rb"));
				expect(statusBarMessage.called).to.be.true;
			});

		});

		test('for model files', async () => {
			await openFileForTests('/app/models/product.rb');
			
			await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
			
			let editor = utils.findEditor();
			if (!editor) { return; }
	
			expect(editor.document.fileName).to.be.equal(fullPathForTests("/spec/models/product_spec.rb"));
		});

		test('for unsuitable file', async () => {
			const statusBarMessage = sinon.stub(window, "setStatusBarMessage");
			await openFileForTests('/unsuitable_file.rb');
			
			await commands.executeCommand('navigate-rails-files.change-to-rspec-file');
			
			let editor = utils.findEditor();
			if (!editor) { return; }
	
			expect(editor.document.fileName).to.be.equal(fullPathForTests("/unsuitable_file.rb"));
			expect(statusBarMessage.called).to.be.true;
		});
	});
});

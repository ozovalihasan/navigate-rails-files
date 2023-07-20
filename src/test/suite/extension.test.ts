// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { window, commands, Uri, workspace } from 'vscode';
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as utils from '../../utils';
import * as path from 'path';
import { afterEach, before, beforeEach } from 'mocha';


const testFolderLocation = '/../../../src/test/suite/example';

const openFileForTests = async(filePath: string = '/app/controllers/products_controller.rb') => {
	const document = await workspace.openTextDocument(fullPathForTests(filePath));
	await window.showTextDocument(document);
};

const fullPathForTests = (filePath: string) => (path.resolve(__dirname + testFolderLocation + filePath));

const setExpectation = (command: string) => (async (filePath: string, expectedFilePath?: string, callback?: Function) => {
	let statusBarMessage: any = null;
	if (expectedFilePath) {
		statusBarMessage = sinon.spy(vscode.window, 'setStatusBarMessage');	
	} else {
		statusBarMessage = sinon.stub(vscode.window, 'setStatusBarMessage');	
	}
	

	await openFileForTests(filePath);
	if (callback) {callback();}
	await commands.executeCommand(command);
	
	let openedFileName = "";

	let editor = utils.findEditor();
	if (editor) { 
		openedFileName = editor.document.fileName; 
	};

	if (expectedFilePath) {
		expect(openedFileName).to.be.equal(fullPathForTests(expectedFilePath));
		expect(statusBarMessage.called).to.be.false;
	} else {
		expect(openedFileName).to.be.equal(fullPathForTests(filePath));
		expect(statusBarMessage.called).to.be.true;
	}
});

suite('Extension Test Suite', () => {
	beforeEach(() => {
    commands.executeCommand('workbench.action.closeActiveEditor');
  });

	afterEach(() => {
    commands.executeCommand('workbench.action.closeActiveEditor');
		sinon.restore();
  });

	
	window.showInformationMessage('Start all tests.');

	suite('Test "navigateRailsFiles.openRbFile" command', () => {
		let runExpectation: (filePath: string, expectedFilePath?: string, callback?: Function) => Promise<void>;
		
		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.openRbFile');
		});

		suite('for view related files', () => {
			test('if a view file is opened', async () => {
				await runExpectation(
					'/app/views/products/index.html.erb',
					'/app/controllers/products_controller.rb'
				);
				
				expect(utils.inActionBlock('index')).to.be.true;
			});
			
			test('if a controller file is opened', async () => {
				await runExpectation(
					'/app/controllers/products_controller.rb',
					undefined,
					() => utils.moveCursorToStr('A point below the action "index"')
				);
				
			});
	
			test('if a view test file is opened', async () => {
				await runExpectation(
					'/spec/views/products/index.html.erb_spec.rb',
					'/app/controllers/products_controller.rb'
				);
				
				expect(utils.inActionBlock('index')).to.be.true;
			});
		});
		
		suite('for model related files', () => {
			test('if a model file is opened', async () => {
				await runExpectation('/app/models/product.rb');
				
			});
	
			test('if a model test file is opened', async () => {
				await runExpectation(
					'/spec/models/product_spec.rb',
					'/app/models/product.rb'
				);
			});
		});
	});

	suite('Test "navigateRailsFiles.changeToAppHtmlFile" command', () => {
		let runExpectation: (filePath: string, expectedFilePath?: string, callback?: Function) => Promise<void>;
		
		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.changeToAppHtmlFile');
		});
		
		suite('for views', () => {
			test('if a app/html file is opened', async () => {
				await runExpectation('/app/views/products/index.html.erb');
			});

			test('if a app/turbo_stream file is opened', async () => {
				await runExpectation(
					'/app/views/products/index.turbo_stream.erb',
					'/app/views/products/index.html.erb'
				);
			});

			test('if a app/turbo_stream file is opened and there is no an action.html.erb file', async () => {
				await runExpectation('/app/views/products/show.turbo_stream.erb');
			});
		});
			
		suite('for controllers', () => {
			test('if there is a html.erb of the action', async () => {
				await runExpectation(
					'/app/controllers/products_controller.rb',
					'/app/views/products/index.html.erb',
					() => utils.moveCursorToStr('A point in the action "index"')
				);
			});

			test('if there is no a html.erb of the action', async () => {
				await runExpectation(
					'/app/controllers/products_controller.rb',
					'/app/views/products/create.turbo_stream.erb',
					() => utils.moveCursorToStr('A point in the action "create"')
				);
			});
		});

		suite('for test files', () => {
			test('if a html.erb_spec.rb file is opened', async () => {
				await runExpectation(
					'/spec/views/products/index.html.erb_spec.rb',
					'/app/views/products/index.html.erb'
				);
			});

			test('if a turbo_stream.erb_spec.rb file is opened', async () => {
				await runExpectation(
					'/spec/views/products/index.turbo_stream.erb_spec.rb',
					'/app/views/products/index.html.erb'
				);
			});
			
			test('if a turbo_stream.erb_spec.rb file is opened and there is no an action.html.erb file', async () => {
				await runExpectation(
					'/spec/views/products/show.turbo_stream.erb_spec.rb',
					'/app/views/products/show.turbo_stream.erb'
				);
			});
	
		});

		test('for unsuitable file', async () => {
			await runExpectation('/app/models/product.rb');
		});
	});

	suite('Test "navigateRailsFiles.changeToAppTurboStreamFile" command', () => {
		let runExpectation: (filePath: string, expectedFilePath?: string, callback?: Function) => Promise<void>;
		
		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.changeToAppTurboStreamFile');
		});
		
		suite('for views', () => {
			test('if a app/turbo_stream file is opened', async () => {
				await runExpectation('/app/views/products/index.turbo_stream.erb');
			});

			test('if a app/html file is opened and there is no an action.turbo_stream.erb file', async () => {
				await runExpectation('/app/views/products/edit.html.erb');
			});
		});
			
		suite('for controllers', () => {
			test('if there is a turbo_stream.erb file of the action', async () => {
				await runExpectation(
					'/app/controllers/products_controller.rb',
					'/app/views/products/index.turbo_stream.erb',
					() => utils.moveCursorToStr('A point in the action "index"')
				);
			});

			test('if there is no a turbo_stream.erb file of the action', async () => {
				await runExpectation(
					'/app/controllers/products_controller.rb', 
					undefined,
					() => utils.moveCursorToStr('A point in the action "edit"')
				);
			});
		});

		suite('for test files', () => {
			test('if a html.erb_spec.rb file is opened', async () => {
				await runExpectation(
					'/spec/views/products/index.html.erb_spec.rb', 
					'/app/views/products/index.turbo_stream.erb'
				);
			});

			test('if a turbo_stream.erb_spec.rb file is opened', async () => {
				await runExpectation(
					'/spec/views/products/index.turbo_stream.erb_spec.rb', 
					'/app/views/products/index.turbo_stream.erb'
				);
			});
			
			test('if a html.erb_spec.rb file is opened and there is no an action.turbo_stream.erb file', async () => {
				await runExpectation('/spec/views/products/edit.html.erb_spec.rb');
			});
	
		});

		test('for unsuitable file', async () => {
			await runExpectation('/app/models/product.rb');
		});
	});

	suite('Test "navigateRailsFiles.changeToRspecFile" command', () => {
		let runExpectation: (filePath: string, expectedFilePath?: string, callback?: Function) => Promise<void>;
		
		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.changeToRspecFile');
		});

		suite('for views', () => {
			test('if a spec/html file is opened', async () => {
				await runExpectation('/spec/views/products/index.html.erb_spec.rb');
			});

			test('if a spec/turbo_stream file is opened', async () => {
				await runExpectation('/spec/views/products/index.turbo_stream.erb_spec.rb');
			});

			test('if a app/html file is opened', async () => {
				await runExpectation(
					'/app/views/products/index.html.erb',
					'/spec/views/products/index.html.erb_spec.rb'
				);
			});

			test('if a app/turbo_stream file is opened', async () => {
				await runExpectation(
					'/app/views/products/index.turbo_stream.erb',
					'/spec/views/products/index.turbo_stream.erb_spec.rb'
				);
			});
		});
			
		suite('for controllers', () => {
			test('if there is a html.erb_spec.rb file of the action', async () => {
				await runExpectation(
					'/app/controllers/products_controller.rb', 
					'/spec/requests/products_spec.rb',
					() => utils.moveCursorToStr('A point in the action "index"')
				);
			});
		});

		suite('for test files', () => {
			test('if a html.erb_spec.rb file is opened', async () => {
				await runExpectation('/spec/views/products/index.html.erb_spec.rb');
				
			});

			test('if a turbo_stream.erb_spec.rb file is opened', async () => {
				await runExpectation('/spec/views/products/index.turbo_stream.erb_spec.rb');
			});

		});

		test('for model files', async () => {
			await runExpectation(
				'/app/models/product.rb',
				'/spec/models/product_spec.rb'
			);
		});

		test('for unsuitable file', async () => {
			await runExpectation('/unsuitable_file.rb');
		});
	});
});

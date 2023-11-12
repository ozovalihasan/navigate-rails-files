// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { window, commands, Uri, workspace } from 'vscode';
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as utils from '../../utils';
import { afterEach, before, beforeEach } from 'mocha';

const setExpectation = (command: string) => (async (filePath: string, expectedFilePath?: "same" | string, moveToAction?: string | null, selectedText?: string) => {
	sinon.restore();

	if (!selectedText){
		sinon.stub(utils, "isCurrentTextHavingComponent").returns(false);
	}

	if (filePath === expectedFilePath) {
		expectedFilePath = "same";
	}

	if (expectedFilePath?.match("with_sidecar")){
		sinon.stub(workspace, 'getConfiguration').returns(
			{
				get: sinon.stub().withArgs('useViewComponentsSidecar').returns(true).withArgs("templateEngines").returns(["erb", "slim", "haml"]),
			} as any
		);
	}

	sinon.stub(utils, "getTextUntilCursor").returns("def index");
	sinon.stub(utils, "getActiveFileName").returns("mock_root_folder/" + filePath);

	let checkFileExists;
	if (expectedFilePath){
		checkFileExists = sinon.stub(utils, "checkFileExists").returns(false);
	} else {
		checkFileExists = sinon.stub(utils, "checkFileExists").returns(true);
	}
	const openDocument = sinon.spy(utils, "openDocument");
	
	sinon.stub(workspace, "openTextDocument");
	sinon.stub(window, "showTextDocument");

	let statusBarMessage: any = null;
	if (expectedFilePath) {
		if (expectedFilePath === "same") {
			checkFileExists.withArgs(filePath).returns(true);
		} else {
			checkFileExists.withArgs(expectedFilePath).returns(true);
		}
		statusBarMessage = sinon.spy(vscode.window, 'setStatusBarMessage');	
	} else {
		statusBarMessage = sinon.stub(vscode.window, 'setStatusBarMessage');	
	}

	let moveCursorToAction: any = null;
	if (moveToAction) {
		moveCursorToAction = sinon.stub(utils, "moveCursorToAction");
	}

	sinon.stub(utils, 'findEditor').returns({document: {fileName: filePath, getText: () => selectedText || ""}} as vscode.TextEditor);
	
	await commands.executeCommand(command);
	
	if (expectedFilePath === "same") {
		expect(openDocument.calledWith(filePath)).to.be.true;
		expect(statusBarMessage.called).to.be.true;
	} else if (expectedFilePath) {
		expect(openDocument.calledWith(expectedFilePath)).to.be.true;
		expect(statusBarMessage.called).to.be.false;
	} else {
		expect(openDocument.called).to.be.false;
		expect(statusBarMessage.called).to.be.true;
	}
	
	if (moveToAction) {
		expect(moveCursorToAction.calledWith(moveToAction)).to.be.true;
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
		let runExpectation: (filePath: string, expectedFilePath?: string, moveToAction?: string | null, selectedText?: string) => Promise<void>;
		let targetPath: string;

		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.openRbFile');
		});

		test('opens a component"s ruby file if the selected text contains a component name', async () => { 
			await runExpectation("mock_file_path", 'app/components/mock_folder/mock_component.rb', null, "MockFolder::MockComponent.new");
		});
		
		test('for view related files', async () => { 
			targetPath = 'app/controllers/products_controller.rb';

			await runExpectation('app/controllers/products_controller.rb', targetPath, 'index');

			await runExpectation('app/views/products/index.html.erb', targetPath, 'index');
			await runExpectation('app/views/products/index.html.slim', targetPath, 'index');
			await runExpectation('app/views/products/index.html.haml', targetPath, 'index');
			await runExpectation('app/views/products/index.turbo_stream.erb', targetPath, 'index');
			await runExpectation('app/views/products/index.turbo_stream.slim', targetPath, 'index');
			await runExpectation('app/views/products/index.turbo_stream.haml', targetPath, 'index');
			
			await runExpectation('spec/views/products/index.html.erb_spec.rb', targetPath, 'index');
			await runExpectation('spec/views/products/index.html.slim_spec.rb', targetPath, 'index');
			await runExpectation('spec/views/products/index.html.haml_spec.rb', targetPath, 'index');
			await runExpectation('spec/views/products/index.turbo_stream.erb_spec.rb', targetPath, 'index');
			await runExpectation('spec/views/products/index.turbo_stream.slim_spec.rb', targetPath, 'index');
			await runExpectation('spec/views/products/index.turbo_stream.haml_spec.rb', targetPath, 'index');
			
			await runExpectation('spec/requests/products_spec.rb', targetPath);
		});
		
		test('for model files', async () => {
			targetPath = 'app/models/product.rb';

			await runExpectation('app/models/product.rb', targetPath);
			await runExpectation('spec/models/product_spec.rb', targetPath);
		});
		
		test('for component files', async () => {
			targetPath = 'app/components/mock_component.rb';

			await runExpectation('app/components/mock_component.rb', targetPath);
			await runExpectation('app/components/mock_component.html.erb', targetPath);
			await runExpectation('app/components/mock_component.html.slim', targetPath);
			await runExpectation('app/components/mock_component.html.haml', targetPath);
			await runExpectation('spec/components/mock_component_spec.rb', targetPath);
			
			await runExpectation('app/components/mock_component.rb', "same");
			await runExpectation('app/components/mock_component.html.erb', targetPath);
			await runExpectation('app/components/mock_component.html.slim', targetPath);
			await runExpectation('app/components/mock_component.html.haml', targetPath);
			await runExpectation('spec/components/mock_component_spec.rb', targetPath);
		});
	});
	
	suite('Test "navigateRailsFiles.changeToAppHtmlFile" command', () => {
		let runExpectation: (filePath: string, expectedFilePath?: string, moveToAction?: string | null, selectedText?: string) => Promise<void>;
		let targetPath: string;

		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.changeToAppHtmlFile');
		});

		test('opens a component"s view file if the selected text contains a component name', async () => { 
			await runExpectation("mock_file_path", 'app/components/mock_folder/mock_component.html.erb', null, "MockFolder::MockComponent.new");
		});

		test('opens a component"s view file if the selected text contains a component name and useViewComponentsSidecar is true', async () => { 
			await runExpectation("mock_file_path", 'app/components/mock_folder/with_sidecar_component/with_sidecar_component.html.erb', null, "MockFolder::WithSidecarComponent.new");
		});

		test('for view related files',async () => {

				targetPath = 'app/views/products/index.html.erb';

				await runExpectation('app/controllers/products_controller.rb', targetPath);
				await runExpectation('app/controllers/products_controller.rb', 'app/views/products/index.turbo_stream.erb');

				await runExpectation('app/views/products/index.html.erb', targetPath);
				await runExpectation('app/views/products/index.html.slim', targetPath);
				await runExpectation('app/views/products/index.html.haml', targetPath);
				await runExpectation('app/views/products/index.turbo_stream.erb', targetPath);
				await runExpectation('app/views/products/index.turbo_stream.slim', targetPath);
				await runExpectation('app/views/products/index.turbo_stream.haml', targetPath);

				await runExpectation('app/views/products/index.html.erb', "same");
				await runExpectation('app/views/products/index.html.slim', "same");
				await runExpectation('app/views/products/index.html.haml', "same");
				await runExpectation('app/views/products/index.turbo_stream.erb', "same");
				await runExpectation('app/views/products/index.turbo_stream.slim', "same");
				await runExpectation('app/views/products/index.turbo_stream.haml', "same");
				
				await runExpectation('spec/views/products/index.html.erb_spec.rb', targetPath);
				await runExpectation('spec/requests/products_spec.rb');
		});

		test('for model files', async () => {
			await runExpectation('app/models/product.rb');
			await runExpectation('spec/models/product_spec.rb');
		});
		
		test('for component files', async () => {
			targetPath = 'app/components/mock_component.html.erb';
			await runExpectation('app/components/mock_component.rb', targetPath);
			await runExpectation('app/components/mock_component.html.erb', targetPath);
			await runExpectation('app/components/mock_component.html.slim', targetPath);
			await runExpectation('app/components/mock_component.html.haml', targetPath);
			await runExpectation('spec/components/mock_component_spec.rb', targetPath);
		});
	});
	
	suite('Test "navigateRailsFiles.changeToAppTurboStreamFile" command', () => {
		let runExpectation: (filePath: string, expectedFilePath?: string, moveToAction?: string | null, selectedText?: string) => Promise<void>;
		let targetPath: string;

		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.changeToAppTurboStreamFile');
		});

		test('opens a component"s view file if the selected text contains a component name', async () => { 
			await runExpectation("mock_file_path", 'app/components/mock_folder/mock_component.html.erb', null, "MockFolder::MockComponent.new");
		});

		test('for view related files',async () => {

				targetPath = 'app/views/products/index.turbo_stream.erb';

				await runExpectation('app/controllers/products_controller.rb', targetPath);
				await runExpectation('app/controllers/products_controller.rb', 'app/views/products/index.turbo_stream.erb');

				await runExpectation('app/views/products/index.html.erb', targetPath);
				await runExpectation('app/views/products/index.html.slim', targetPath);
				await runExpectation('app/views/products/index.html.haml', targetPath);
				await runExpectation('app/views/products/index.turbo_stream.erb', targetPath);
				await runExpectation('app/views/products/index.turbo_stream.slim', targetPath);
				await runExpectation('app/views/products/index.turbo_stream.haml', targetPath);

				await runExpectation('app/views/products/index.html.erb', "app/views/products/index.turbo_stream.erb");
				await runExpectation('app/views/products/index.html.slim', "app/views/products/index.turbo_stream.slim");
				await runExpectation('app/views/products/index.html.haml', "app/views/products/index.turbo_stream.haml");
				await runExpectation('app/views/products/index.turbo_stream.erb', "same");
				await runExpectation('app/views/products/index.turbo_stream.slim', "same");
				await runExpectation('app/views/products/index.turbo_stream.haml', "same");
				
				await runExpectation('spec/views/products/index.html.erb_spec.rb', targetPath);
				await runExpectation('spec/requests/products_spec.rb');
		});

		test('for model files', async () => {
			await runExpectation('app/models/product.rb');
			await runExpectation('spec/models/product_spec.rb');
		});
		
		test('for component files', async () => {
			await runExpectation('app/components/mock_component.rb');
			
			await runExpectation('app/components/mock_component.html.erb');
			await runExpectation('app/components/mock_component.html.slim');
			await runExpectation('app/components/mock_component.html.haml');
			
			await runExpectation('spec/components/mock_component_spec.rb');
		});
	});

	suite('Test "navigateRailsFiles.changeToRspecFile" command', () => {
		let runExpectation: (filePath: string, expectedFilePath?: string, moveToAction?: string | null, selectedText?: string) => Promise<void>;
		let targetPath: string;

		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.changeToRspecFile');
		});
		
		test('opens a component"s test file if the selected text contains a component name', async () => { 
			await runExpectation("mock_file_path", 'spec/components/mock_folder/mock_component_spec.rb', null, "MockFolder::MockComponent.new");
		});

		test('for view related files',async () => {
				await runExpectation('app/controllers/products_controller.rb', "spec/requests/products_spec.rb");
				
				await runExpectation('app/views/products/index.html.erb', "spec/views/products/index.html.erb_spec.rb");
				await runExpectation('app/views/products/index.html.slim', "spec/views/products/index.html.slim_spec.rb");
				await runExpectation('app/views/products/index.html.haml', "spec/views/products/index.html.haml_spec.rb");
				await runExpectation('app/views/products/index.turbo_stream.erb', "spec/views/products/index.turbo_stream.erb_spec.rb");
				await runExpectation('app/views/products/index.turbo_stream.slim', "spec/views/products/index.turbo_stream.slim_spec.rb");
				await runExpectation('app/views/products/index.turbo_stream.haml', "spec/views/products/index.turbo_stream.haml_spec.rb");

				await runExpectation('spec/views/products/index.html.erb_spec.rb', "same");
				await runExpectation('spec/views/products/index.html.slim_spec.rb', "same");
				await runExpectation('spec/views/products/index.html.haml_spec.rb', "same");

				await runExpectation('spec/views/products/index.turbo_stream.erb_spec.rb', "same");
				await runExpectation('spec/views/products/index.turbo_stream.slim_spec.rb', "same");
				await runExpectation('spec/views/products/index.turbo_stream.haml_spec.rb', "same");
				
				await runExpectation('spec/requests/products_spec.rb');
		});

		test('for model files', async () => {
			targetPath = 'spec/models/product_spec.rb';

			await runExpectation('app/models/product.rb', targetPath);
			await runExpectation('spec/models/product_spec.rb', targetPath);
		});
		
		test('for component files', async () => {
			targetPath = "spec/components/mock_component_spec.rb";
			
			await runExpectation('app/components/mock_component.rb', targetPath);
			
			await runExpectation('app/components/mock_component.html.erb', targetPath);
			await runExpectation('app/components/mock_component.html.slim', targetPath);
			await runExpectation('app/components/mock_component.html.haml', targetPath);
			
			await runExpectation('spec/components/mock_component_spec.rb', targetPath);
		});
	});
});

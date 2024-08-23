// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { window, commands, Uri, workspace } from 'vscode';
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as utils from '../../utils';
import { afterEach, before, beforeEach } from 'mocha';

const setExpectation = (command: string) => (async (filePath: string, options: {expectedFilePath?: "same" | string | null, moveToAction?: string | null, selectedText?: string | null, beforeFunction?: Function | null} = {}) => {
	sinon.restore();

	if (options.beforeFunction) { options.beforeFunction() }

	

	if (filePath === options.expectedFilePath) {
		options.expectedFilePath = "same";
	}

	if (options.expectedFilePath?.match("with_sidecar")){
		sinon.stub(workspace, 'getConfiguration').returns(
			{
				get: sinon.stub().withArgs('useViewComponentsSidecar').returns(true).withArgs("templateEngines").returns(["erb", "slim", "haml"]),
			} as any
		);
	}

	sinon.stub(utils, "getTextUntilCursor").returns("def index");
	sinon.stub(utils, "getActiveFileName").returns("mock_root_folder/" + filePath);

	let checkFileExists;
	if (options.expectedFilePath){
		checkFileExists = sinon.stub(utils, "checkFileExists").returns(false);
	} else {
		checkFileExists = sinon.stub(utils, "checkFileExists").returns(true);
	}
	const openDocument = sinon.spy(utils, "openDocument");
	
	sinon.stub(workspace, "openTextDocument");
	sinon.stub(window, "showTextDocument");

	let statusBarMessage: any = null;
	if (options.expectedFilePath) {
		if (options.expectedFilePath === "same") {
			checkFileExists.withArgs(filePath).returns(true);
		} else {
			checkFileExists.withArgs(options.expectedFilePath).returns(true);
		}
		statusBarMessage = sinon.spy(vscode.window, 'setStatusBarMessage');	
	} else {
		statusBarMessage = sinon.stub(vscode.window, 'setStatusBarMessage');	
	}

	let moveCursorToAction: any = null;
	if (options.moveToAction) {
		moveCursorToAction = sinon.stub(utils, "moveCursorToAction");
	}

	sinon.stub(utils, 'findEditor').returns({document: {fileName: filePath, getText: () => options.selectedText || ""}} as vscode.TextEditor);
	
	await commands.executeCommand(command);
	
	if (options.expectedFilePath === "same") {
		expect(openDocument.calledWith(filePath)).to.be.true;
		expect(statusBarMessage.called).to.be.true;
	} else if (options.expectedFilePath) {
		expect(openDocument.calledWith(options.expectedFilePath)).to.be.true;
		expect(statusBarMessage.called).to.be.false;
	} else {
		expect(openDocument.called).to.be.false;
		expect(statusBarMessage.called).to.be.true;
	}
	
	if (options.moveToAction) {
		expect(moveCursorToAction.calledWith(options.moveToAction)).to.be.true;
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
		let runExpectation: (filePath: string, options?: { expectedFilePath?: "same" | string | null; moveToAction?: string | null; selectedText?: string | null; beforeFunction?: Function | null}) => Promise<void>;
		let targetPath: string;
		let targetMailerPath: string;

		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.openRbFile');
		});

		test('opens a component"s ruby file if the selected text contains a component name', async () => { 
			await runExpectation("mock_file_path", {expectedFilePath: 'app/components/mock_folder/mock_component.rb', selectedText: "MockFolder::MockComponent.new"});
		});
		
		test('for controller related files', async () => { 
			targetPath = 'app/controllers/products_controller.rb';

			await runExpectation('app/controllers/products_controller.rb', {expectedFilePath: targetPath, moveToAction: 'index'});

			await runExpectation('app/views/products/index.html.erb', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('app/views/products/index.html.slim', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('app/views/products/index.html.haml', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('app/views/products/index.turbo_stream.erb', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('app/views/products/index.turbo_stream.slim', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('app/views/products/index.turbo_stream.haml', {expectedFilePath: targetPath, moveToAction: 'index'});
			
			await runExpectation('spec/views/products/index.html.erb_spec.rb', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('spec/views/products/index.html.slim_spec.rb', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('spec/views/products/index.html.haml_spec.rb', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('spec/views/products/index.turbo_stream.erb_spec.rb', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('spec/views/products/index.turbo_stream.slim_spec.rb', {expectedFilePath: targetPath, moveToAction: 'index'});
			await runExpectation('spec/views/products/index.turbo_stream.haml_spec.rb', {expectedFilePath: targetPath, moveToAction: 'index'});

			await runExpectation('spec/requests/products_spec.rb', {expectedFilePath: targetPath});
		});
		
		test('for mailer related files', async () => { 
			targetPath = 'app/mailers/product_mailer.rb';

			await runExpectation('app/mailers/product_mailer.rb', {expectedFilePath: targetMailerPath, moveToAction: 'index'});

			await runExpectation('app/mailers/product_mailer/index.html.erb', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('app/mailers/product_mailer/index.html.slim', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('app/mailers/product_mailer/index.html.haml', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('app/mailers/product_mailer/index.text.erb', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('app/mailers/product_mailer/index.text.slim', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('app/mailers/product_mailer/index.text.haml', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			
			await runExpectation('spec/mailers/product_mailer/index.html.erb', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('spec/mailers/product_mailer/index.html.slim', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('spec/mailers/product_mailer/index.html.haml', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('spec/mailers/product_mailer/index.text.erb', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('spec/mailers/product_mailer/index.text.slim', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
			await runExpectation('spec/mailers/product_mailer/index.text.haml', {expectedFilePath: targetMailerPath, moveToAction: 'index'});
		});
		
		test('for model files', async () => {
			targetPath = 'app/models/product.rb';

			await runExpectation('app/models/product.rb', {expectedFilePath: "same"});
			await runExpectation('spec/models/product_spec.rb', {expectedFilePath: targetPath});
		});
		
		test('for component files', async () => {
			targetPath = 'app/components/mock_component.rb';

			await runExpectation('app/components/mock_component.rb', {expectedFilePath: "same"});
			await runExpectation('app/components/mock_component.html.erb', {expectedFilePath: targetPath});
			await runExpectation('app/components/mock_component.html.slim', {expectedFilePath: targetPath});
			await runExpectation('app/components/mock_component.html.haml', {expectedFilePath: targetPath});
			
			await runExpectation('spec/components/mock_component_spec.rb', {expectedFilePath: targetPath});
		});

		test('for component files when sidecar usage is enabled ', async () => {
			const runBefore = () => {
				sinon.stub(workspace, 'getConfiguration').returns(
					{
						get: sinon.stub().withArgs('useViewComponentsSidecar').returns(true),
					} as any
				);
			}
			
			targetPath = 'app/components/mock_component.rb';

			await runExpectation('app/components/mock_component.rb', {expectedFilePath: "same"});
			await runExpectation('app/components/mock_component.html.erb', {expectedFilePath: targetPath});
			await runExpectation('app/components/mock_component.html.slim', {expectedFilePath: targetPath});
			await runExpectation('app/components/mock_component.html.haml', {expectedFilePath: targetPath});
			
			await runExpectation('spec/components/mock_component_spec.rb', {expectedFilePath: targetPath});
		});
	});
	
	suite('Test "navigateRailsFiles.changeToAppHtmlFile" command', () => {
		let runExpectation: (filePath: string, options?: { expectedFilePath?: "same" | string | null; moveToAction?: string | null; selectedText?: string | null; beforeFunction?: Function | null}) => Promise<void>;
		let targetPath: string;

		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.changeToAppHtmlFile');
		});

		test('opens a component"s view file if the selected text contains a component name', async () => { 
			await runExpectation("mock_file_path", {expectedFilePath: 'app/components/mock_folder/mock_component.html.erb', selectedText: "MockFolder::MockComponent.new"});
		});

		test('opens a component"s view file if the selected text contains a component name and useViewComponentsSidecar is true', async () => { 
			const beforeFunction = () => {
				sinon.stub(utils, "isSidecarUsedForComponents").returns(true);
			}
			await runExpectation("mock_file_path", {expectedFilePath: 'app/components/mock_folder/with_sidecar_component/with_sidecar_component.html.erb', selectedText: "MockFolder::WithSidecarComponent.new", beforeFunction: beforeFunction});
		});

		test('for view related files',async () => {

				targetPath = 'app/views/products/index.html.erb';

				await runExpectation('app/controllers/products_controller.rb', {expectedFilePath: targetPath});
				await runExpectation('app/controllers/products_controller.rb', {expectedFilePath: 'app/views/products/index.turbo_stream.erb'});

				await runExpectation('app/views/products/index.html.erb', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.html.slim', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.html.haml', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.turbo_stream.erb', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.turbo_stream.slim', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.turbo_stream.haml', {expectedFilePath: targetPath});

				await runExpectation('app/views/products/index.html.erb', {expectedFilePath: "same"});
				await runExpectation('app/views/products/index.html.slim', {expectedFilePath: "same"});
				await runExpectation('app/views/products/index.html.haml', {expectedFilePath: "same"});
				await runExpectation('app/views/products/index.turbo_stream.erb', {expectedFilePath: "same"});
				await runExpectation('app/views/products/index.turbo_stream.slim', {expectedFilePath: "same"});
				await runExpectation('app/views/products/index.turbo_stream.haml', {expectedFilePath: "same"});
				
				await runExpectation('spec/views/products/index.html.erb_spec.rb', {expectedFilePath: targetPath});
				await runExpectation('spec/requests/products_spec.rb');
		});

		test('for model files', async () => {
			await runExpectation('app/models/product.rb');
			await runExpectation('spec/models/product_spec.rb');
		});
		
		test('for component files', async () => {
			targetPath = 'app/components/mock_component.html.erb';
			await runExpectation('app/components/mock_component.rb', {expectedFilePath: targetPath});
			await runExpectation('app/components/mock_component.html.erb', {expectedFilePath: targetPath});
			await runExpectation('app/components/mock_component.html.slim', {expectedFilePath: targetPath});
			await runExpectation('app/components/mock_component.html.haml', {expectedFilePath: targetPath});
			await runExpectation('spec/components/mock_component_spec.rb', {expectedFilePath: targetPath});
		});
	});
	
	suite('Test "navigateRailsFiles.changeToAppTurboStreamFile" command', () => {
		let runExpectation: (filePath: string, options?: { expectedFilePath?: "same" | string | null; moveToAction?: string | null; selectedText?: string | null; beforeFunction?: Function | null}) => Promise<void>;
		let targetPath: string;

		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.changeToAppTurboStreamFile');
		});

		test('opens a component"s view file if the selected text contains a component name', async () => { 
			await runExpectation("mock_file_path", {expectedFilePath: 'app/components/mock_folder/mock_component.html.erb', selectedText: "MockFolder::MockComponent.new"});
		});

		test('for view related files',async () => {

				targetPath = 'app/views/products/index.turbo_stream.erb';

				await runExpectation('app/controllers/products_controller.rb', {expectedFilePath: targetPath});
				await runExpectation('app/controllers/products_controller.rb', {expectedFilePath: 'app/views/products/index.turbo_stream.erb'});

				await runExpectation('app/views/products/index.html.erb', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.html.slim', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.html.haml', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.turbo_stream.erb', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.turbo_stream.slim', {expectedFilePath: targetPath});
				await runExpectation('app/views/products/index.turbo_stream.haml', {expectedFilePath: targetPath});

				await runExpectation('app/views/products/index.html.erb', {expectedFilePath: "app/views/products/index.turbo_stream.erb"});
				await runExpectation('app/views/products/index.html.slim', {expectedFilePath: "app/views/products/index.turbo_stream.slim"});
				await runExpectation('app/views/products/index.html.haml', {expectedFilePath: "app/views/products/index.turbo_stream.haml"});
				await runExpectation('app/views/products/index.turbo_stream.erb', {expectedFilePath: "same"});
				await runExpectation('app/views/products/index.turbo_stream.slim', {expectedFilePath: "same"});
				await runExpectation('app/views/products/index.turbo_stream.haml', {expectedFilePath: "same"});
				
				await runExpectation('spec/views/products/index.html.erb_spec.rb', {expectedFilePath: targetPath});
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
		let runExpectation: (filePath: string, options?: { expectedFilePath?: "same" | string | null; moveToAction?: string | null; selectedText?: string | null; beforeFunction?: Function | null}) => Promise<void>;
		let targetPath: string;

		before(() => {
			runExpectation = setExpectation('navigateRailsFiles.changeToRspecFile');
		});
		
		test('opens a component"s test file if the selected text contains a component name', async () => { 
			await runExpectation("mock_file_path", {expectedFilePath: 'spec/components/mock_folder/mock_component_spec.rb', selectedText: "MockFolder::MockComponent.new"});
		});

		test('for view related files',async () => {
				await runExpectation('app/controllers/products_controller.rb', {expectedFilePath: "spec/requests/products_spec.rb"});
				
				await runExpectation('app/views/products/index.html.erb', {expectedFilePath: "spec/views/products/index.html.erb_spec.rb"});
				await runExpectation('app/views/products/index.html.slim', {expectedFilePath: "spec/views/products/index.html.slim_spec.rb"});
				await runExpectation('app/views/products/index.html.haml', {expectedFilePath: "spec/views/products/index.html.haml_spec.rb"});
				await runExpectation('app/views/products/index.turbo_stream.erb', {expectedFilePath: "spec/views/products/index.turbo_stream.erb_spec.rb"});
				await runExpectation('app/views/products/index.turbo_stream.slim', {expectedFilePath: "spec/views/products/index.turbo_stream.slim_spec.rb"});
				await runExpectation('app/views/products/index.turbo_stream.haml', {expectedFilePath: "spec/views/products/index.turbo_stream.haml_spec.rb"});

				await runExpectation('spec/views/products/index.html.erb_spec.rb', {expectedFilePath: "same"});
				await runExpectation('spec/views/products/index.html.slim_spec.rb', {expectedFilePath: "same"});
				await runExpectation('spec/views/products/index.html.haml_spec.rb', {expectedFilePath: "same"});

				await runExpectation('spec/views/products/index.turbo_stream.erb_spec.rb', {expectedFilePath: "same"});
				await runExpectation('spec/views/products/index.turbo_stream.slim_spec.rb', {expectedFilePath: "same"});
				await runExpectation('spec/views/products/index.turbo_stream.haml_spec.rb', {expectedFilePath: "same"});
				
				await runExpectation('spec/requests/products_spec.rb');
		});

		test('for model files', async () => {
			targetPath = 'spec/models/product_spec.rb';

			await runExpectation('app/models/product.rb', {expectedFilePath: targetPath});
			await runExpectation('spec/models/product_spec.rb', {expectedFilePath: targetPath});
		});
		
		test('for component files', async () => {
			targetPath = "spec/components/mock_component_spec.rb";
			
			await runExpectation('app/components/mock_component.rb', {expectedFilePath: targetPath});
			
			await runExpectation('app/components/mock_component.html.erb', {expectedFilePath: targetPath});
			await runExpectation('app/components/mock_component.html.slim', {expectedFilePath: targetPath});
			await runExpectation('app/components/mock_component.html.haml', {expectedFilePath: targetPath});
			
			await runExpectation('spec/components/mock_component_spec.rb', {expectedFilePath: targetPath});
		});
	});
});

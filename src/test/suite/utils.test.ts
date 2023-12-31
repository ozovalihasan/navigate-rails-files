import { window, commands, Uri, workspace, Range, TextEditor } from 'vscode';
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as utils from '../../utils';
import * as path from 'path';
import { afterEach, beforeEach } from 'mocha';

const testFolderLocation = "/../../../src/test/suite/example/";

const openFileForTests = async(filePath: string = 'app/controllers/products_controller.rb') => {
	const uri = Uri.file(
		path.join(__dirname + testFolderLocation + filePath)
	);
	
	const document = await workspace.openTextDocument(uri);
	await window.showTextDocument(document);
	
};

suite('Utils Test Suite', () => {
	beforeEach(() => {
    commands.executeCommand('workbench.action.closeActiveEditor');

  });

	afterEach(() => {
    commands.executeCommand('workbench.action.closeActiveEditor');
		sinon.restore();
  });

	
	window.showInformationMessage('Start all tests.');

  test('Test isViewRelatedFile function', () => {
    expect(utils.isViewRelatedFile('app/controllers/products_controller.rb')).to.be.true;
    expect(utils.isViewRelatedFile('app/views/products/index.html.erb')).to.be.true;
    expect(utils.isViewRelatedFile('spec/views/products/index.html.erb_spec.rb')).to.be.true;
    expect(utils.isViewRelatedFile('app/views/products/index.turbo_stream.erb')).to.be.true;
    expect(utils.isViewRelatedFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.true;
    expect(utils.isViewFile('app/views/products/index.html.slim')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.html.slim_spec.rb')).to.be.true;
    expect(utils.isViewFile('app/views/products/index.turbo_stream.slim')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.turbo_stream.slim_spec.rb')).to.be.true;
    expect(utils.isViewFile('app/views/products/index.html.haml')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.html.haml_spec.rb')).to.be.true;
    expect(utils.isViewFile('app/views/products/index.turbo_stream.haml')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.turbo_stream.haml_spec.rb')).to.be.true;
    
    expect(utils.isViewRelatedFile('app/models/product.rb')).to.be.false;
    expect(utils.isViewRelatedFile('spec/models/product_spec.rb')).to.be.false;
  });

  test('Test isViewFile function', () => {
    expect(utils.isViewFile('app/views/products/index.html.erb')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.html.erb_spec.rb')).to.be.true;
    expect(utils.isViewFile('app/views/products/index.turbo_stream.erb')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.true;
    expect(utils.isViewFile('app/views/products/index.html.slim')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.html.slim_spec.rb')).to.be.true;
    expect(utils.isViewFile('app/views/products/index.turbo_stream.slim')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.turbo_stream.slim_spec.rb')).to.be.true;
    expect(utils.isViewFile('app/views/products/index.html.haml')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.html.haml_spec.rb')).to.be.true;
    expect(utils.isViewFile('app/views/products/index.turbo_stream.haml')).to.be.true;
    expect(utils.isViewFile('spec/views/products/index.turbo_stream.haml_spec.rb')).to.be.true;
    
    expect(utils.isViewFile('app/controllers/products_controller.rb')).to.be.false;
    expect(utils.isViewFile('app/models/product.rb')).to.be.false;
    expect(utils.isViewFile('spec/models/product_spec.rb')).to.be.false;
  });

  test('Test isControllerFile function', () => {
    expect(utils.isControllerFile('app/controllers/products_controller.rb')).to.be.true;
    
    expect(utils.isControllerFile('app/models/product.rb')).to.be.false;
    expect(utils.isControllerFile('spec/models/product_spec.rb')).to.be.false;
    expect(utils.isControllerFile('app/views/products/index.html.erb')).to.be.false;
    expect(utils.isControllerFile('spec/views/products/index.html.erb_spec.rb')).to.be.false;
    expect(utils.isControllerFile('app/views/products/index.turbo_stream.erb')).to.be.false;
    expect(utils.isControllerFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.false;
    expect(utils.isControllerFile('app/views/products/index.html.slim')).to.be.false;
    expect(utils.isControllerFile('spec/views/products/index.html.slim_spec.rb')).to.be.false;
    expect(utils.isControllerFile('app/views/products/index.turbo_stream.slim')).to.be.false;
    expect(utils.isControllerFile('spec/views/products/index.turbo_stream.slim_spec.rb')).to.be.false;
    expect(utils.isControllerFile('app/views/products/index.html.haml')).to.be.false;
    expect(utils.isControllerFile('spec/views/products/index.html.haml_spec.rb')).to.be.false;
    expect(utils.isControllerFile('app/views/products/index.turbo_stream.haml')).to.be.false;
    expect(utils.isControllerFile('spec/views/products/index.turbo_stream.haml_spec.rb')).to.be.false;
  });

  test('Test isHTMLViewFile function', () => {
    expect(utils.isHTMLViewFile('app/views/products/index.html.erb')).to.be.true;
    expect(utils.isHTMLViewFile('spec/views/products/index.html.erb_spec.rb')).to.be.true;
    expect(utils.isHTMLViewFile('app/views/products/index.html.slim')).to.be.true;
    expect(utils.isHTMLViewFile('spec/views/products/index.html.slim_spec.rb')).to.be.true;
    expect(utils.isHTMLViewFile('app/views/products/index.html.haml')).to.be.true;
    expect(utils.isHTMLViewFile('spec/views/products/index.html.haml_spec.rb')).to.be.true;
    
    expect(utils.isHTMLViewFile('app/controllers/products_controller.rb')).to.be.false;
    expect(utils.isHTMLViewFile('app/models/product.rb')).to.be.false;
    expect(utils.isHTMLViewFile('spec/models/product_spec.rb')).to.be.false;
    expect(utils.isHTMLViewFile('app/views/products/index.turbo_stream.erb')).to.be.false;
    expect(utils.isHTMLViewFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.false;
    expect(utils.isHTMLViewFile('app/views/products/index.turbo_stream.slim')).to.be.false;
    expect(utils.isHTMLViewFile('spec/views/products/index.turbo_stream.slim_spec.rb')).to.be.false;
    expect(utils.isHTMLViewFile('app/views/products/index.turbo_stream.haml')).to.be.false;
    expect(utils.isHTMLViewFile('spec/views/products/index.turbo_stream.haml_spec.rb')).to.be.false;
  });

  test('Test isTurboStreamViewFile function', () => {
    expect(utils.isTurboStreamViewFile('app/views/products/index.turbo_stream.erb')).to.be.true;
    expect(utils.isTurboStreamViewFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.true;
    expect(utils.isTurboStreamViewFile('app/views/products/index.turbo_stream.slim')).to.be.true;
    expect(utils.isTurboStreamViewFile('spec/views/products/index.turbo_stream.slim_spec.rb')).to.be.true;
    expect(utils.isTurboStreamViewFile('app/views/products/index.turbo_stream.haml')).to.be.true;
    expect(utils.isTurboStreamViewFile('spec/views/products/index.turbo_stream.haml_spec.rb')).to.be.true;

    expect(utils.isTurboStreamViewFile('app/controllers/products_controller.rb')).to.be.false;
    expect(utils.isTurboStreamViewFile('app/models/product.rb')).to.be.false;
    expect(utils.isTurboStreamViewFile('spec/models/product_spec.rb')).to.be.false;
    expect(utils.isTurboStreamViewFile('app/views/products/index.html.erb')).to.be.false;
    expect(utils.isTurboStreamViewFile('spec/views/products/index.html.erb_spec.rb')).to.be.false;
    expect(utils.isTurboStreamViewFile('app/views/products/index.html.slim')).to.be.false;
    expect(utils.isTurboStreamViewFile('spec/views/products/index.html.slim_spec.rb')).to.be.false;
    expect(utils.isTurboStreamViewFile('app/views/products/index.html.haml')).to.be.false;
    expect(utils.isTurboStreamViewFile('spec/views/products/index.html.haml_spec.rb')).to.be.false;
  });

  test('Test isModelFile function', () => {
    expect(utils.isModelFile('app/models/product.rb')).to.be.true;
    expect(utils.isModelFile('spec/models/product_spec.rb')).to.be.true;
    
    expect(utils.isModelFile('app/controllers/products_controller.rb')).to.be.false;
    expect(utils.isModelFile('app/views/products/index.html.erb')).to.be.false;
    expect(utils.isModelFile('spec/views/products/index.html.erb_spec.rb')).to.be.false;
    expect(utils.isModelFile('app/views/products/index.turbo_stream.erb')).to.be.false;
    expect(utils.isModelFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.false;
    expect(utils.isModelFile('app/views/products/index.html.slim')).to.be.false;
    expect(utils.isModelFile('spec/views/products/index.html.slim_spec.rb')).to.be.false;
    expect(utils.isModelFile('app/views/products/index.turbo_stream.slim')).to.be.false;
    expect(utils.isModelFile('spec/views/products/index.turbo_stream.slim_spec.rb')).to.be.false;
    expect(utils.isModelFile('app/views/products/index.html.haml')).to.be.false;
    expect(utils.isModelFile('spec/views/products/index.html.haml_spec.rb')).to.be.false;
    expect(utils.isModelFile('app/views/products/index.turbo_stream.haml')).to.be.false;
    expect(utils.isModelFile('spec/views/products/index.turbo_stream.haml_spec.rb')).to.be.false;
  });

  test('Test isTestFile function', () => {
    expect(utils.isTestFile('spec/models/product_spec.rb')).to.be.true;
    expect(utils.isTestFile('spec/views/products/index.html.erb_spec.rb')).to.be.true;
    expect(utils.isTestFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.true;
    expect(utils.isTestFile('spec/views/products/index.html.slim_spec.rb')).to.be.true;
    expect(utils.isTestFile('spec/views/products/index.turbo_stream.slim_spec.rb')).to.be.true;
    expect(utils.isTestFile('spec/views/products/index.html.haml_spec.rb')).to.be.true;
    expect(utils.isTestFile('spec/views/products/index.turbo_stream.haml_spec.rb')).to.be.true;
    
    expect(utils.isTestFile('app/controllers/products_controller.rb')).to.be.false;
    expect(utils.isTestFile('app/models/product.rb')).to.be.false;
    expect(utils.isTestFile('app/views/products/index.turbo_stream.erb')).to.be.false;
    expect(utils.isTestFile('app/views/products/index.html.erb')).to.be.false;
    expect(utils.isTestFile('app/views/products/index.turbo_stream.slim')).to.be.false;
    expect(utils.isTestFile('app/views/products/index.html.slim')).to.be.false;
    expect(utils.isTestFile('app/views/products/index.turbo_stream.haml')).to.be.false;
    expect(utils.isTestFile('app/views/products/index.html.haml')).to.be.false;
  });

  suite("Test findActionAndController function", () => {
    test('for a view', async () => {
      await openFileForTests('app/views/products/index.html.erb');
    
      const {controller, action} = utils.findActionAndController();
      expect(controller).to.be.equal('products');
      expect(action).to.be.equal('index');
    });

    test('for a controller', async () => {
      await openFileForTests('app/controllers/products_controller.rb');

      let controller : string = "";
      let action : string = "";
      
      utils.moveCursorToStr('A point above the action "index"');
      ({controller, action} = utils.findActionAndController());
      expect(controller).to.be.equal('products');
      expect(action).to.be.equal('');

      utils.moveCursorToStr('A point in the action "index"');
      ({controller, action} = utils.findActionAndController());
      expect(controller).to.be.equal('products');
      expect(action).to.be.equal('index');

      utils.moveCursorToStr('A point below the action "index"');
      ({controller, action} = utils.findActionAndController());
      expect(controller).to.be.equal('products');
      expect(action).to.be.equal('index');
    });
  });


  test('Test findEditor function', async () => {
    await openFileForTests('app/controllers/products_controller.rb');
    
    let editor = utils.findEditor();
    expect(editor).to.be.ok;
  });

  test('Test getTextUntilCursor function', async () => {
    await openFileForTests('app/controllers/products_controller.rb');
    
    utils.moveCursorToStr('A point above the action "index"');
    expect(utils.getTextUntilCursor()).to.be.equal(
      'class ProductsController < ApplicationController\n' +
      '  # A point above the action "index"'
    );
  });

  suite('Test findModelName function', () => {
    test('for model file', async () => {
      await openFileForTests('app/models/product.rb');

      expect(utils.findModelName()).to.be.equal("product");
    });

    test('for test file', async () => {
      await openFileForTests('spec/models/product_spec.rb');

      expect(utils.findModelName()).to.be.equal("product");
    });
  });

  test('Test inActionBlock function', async () => {
    await openFileForTests('app/controllers/products_controller.rb');

    utils.moveCursorToStr('A point above the action "index"');
    expect(utils.inActionBlock("index")).to.be.false;

    utils.moveCursorToStr('A point in the action "index"');
    expect(utils.inActionBlock("index")).to.be.true;

    utils.moveCursorToStr('A point below the action "index"');
    expect(utils.inActionBlock("index")).to.be.false;
    
    utils.moveCursorToStr('A point below the action "show"');
    expect(utils.inActionBlock("show")).to.be.false;
  });

  test('Test setRegExp function', async () => {
    expect(utils.setRegExp("mock_string", /mock_regexp_with_special_characters_like(\/\s\w+.*)/, ["mock", "array"], [/mock/, /\.regexp/, /\.array/]).source).to.be.equal(
      /mock_stringmock_regexp_with_special_characters_like(\/\s\w+.*)(mock|array)(mock|\.regexp|\.array)/.source
    );
  });

  test('Test getControllerName function', async () => {
    sinon.stub(utils, "findActionAndController").returns({controller: "mock_controller", action: "mock_action"});
    
    expect(utils.getControllerName()).to.be.equal("mock_controller");
  });
  

  suite('Test openTestFile function', () => {
    let checkFileExists = null as any;
    let openDocument = null as any;
    
    beforeEach(() => {
      openDocument = sinon.stub(utils, "openDocument");
      checkFileExists = sinon.stub(utils, "checkFileExists").returns(false);
    });

    test('if rspec file exists ', async () => {
      checkFileExists.withArgs("spec/models/mock_model_spec.rb").returns(true);
      
      expect(await utils.openTestFile("models/mock_model")).to.be.true;
      expect(openDocument.calledWith("spec/models/mock_model_spec.rb")).to.be.true;
    });

    test("if any test file doesn't exist", async () => {
      expect(await utils.openTestFile("models/mock_model")).to.be.false;
    });
    
  });
  
  test('Test moveCursorToStr function', async () => {
    await openFileForTests('app/controllers/products_controller.rb');

    const editor = utils.findEditor();
    if (!editor) { return; }

    utils.moveCursorToStr('ProductsController');
    let cursorPosition = editor.selection.active; 
    let fileTextToCursor = editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));

    expect(fileTextToCursor.endsWith('ProductsController')).to.be.true;

    utils.moveCursorToStr('A point above the action "index"');
    cursorPosition = editor.selection.active; 
    fileTextToCursor = editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));

    expect(fileTextToCursor.endsWith('A point above the action "index"')).to.be.true;
  });

  suite('Test moveCursorToAction function', () => {
    test('if cursor is in the action block', () => {
      const inActionBlock = sinon.stub(utils, "inActionBlock").returns(true);
      const moveCursorToStr = sinon.stub(utils, "moveCursorToStr");

      utils.moveCursorToAction("mock_action");
      expect(inActionBlock.calledOnce).to.be.true;
      expect(moveCursorToStr.called).to.be.false;
    });

    test('if cursor is not in the action block', () => {
      const inActionBlock = sinon.stub(utils, "inActionBlock").returns(false);
      const moveCursorToStr = sinon.stub(utils, "moveCursorToStr");

      utils.moveCursorToAction("mock_action");
      expect(inActionBlock.calledOnce).to.be.true;
      expect(moveCursorToStr.calledWith("def mock_action")).to.be.true;
    });

  });

  test('Test getProjectRoot function', () => {
    sinon.stub(utils, "getActiveFileName").returns("mock_project_root_folder/app/controllers/product_controller.rb");

    utils.getProjectRoot();
    expect(utils.getProjectRoot()).to.equal("mock_project_root_folder/");
  });

  test('Test getActiveFileName function', () => {
    sinon.stub(vscode.window, 'activeTextEditor').get(() => ({
      document: {
        fileName: 'upper_folder/mock_root_folder/app/mock_file_name.rb',
      }
    }));

    expect(utils.getActiveFileName()).to.equal("upper_folder/mock_root_folder/app/mock_file_name.rb");
  });

  suite('Test openDocument function ', () => {
    test('for an invalid document', async () => {
      const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");

      await utils.openDocument(__dirname + testFolderLocation + "/invalid_document_name");
      expect(statusBarMessage.calledOnce).to.be.true;
    });
    
    test('for a document already opened', async () => {
      const filePath = 'app/controllers/products_controller.rb';
      await openFileForTests(filePath);

      const statusBarMessage = sinon.stub(window, "setStatusBarMessage");

      await utils.openDocument(filePath);
      expect(statusBarMessage.calledOnce).to.be.true;
    });
    
    test('for a document', async () => {
      const filePath = 'app/models/product.rb';
      const spy = sinon.spy();

      await utils.openDocument(filePath, spy);
      expect(spy.calledOnce).to.be.true;
    });
  });

  suite('Test navigateToModelFile function', () => {
    test('if a model exists', async () => {
      sinon.stub(utils, "findModelName").returns("product");
      const openDocument = sinon.stub(utils, "openDocument");

      await utils.navigateToModelFile("app");
      
      expect(openDocument.calledWith("app/models/product.rb")).to.be.true;
    });

    test("if a model doesn't exist", async () => {
      sinon.stub(utils, "findModelName");
      const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");

      await utils.navigateToModelFile("app");
      expect(statusBarMessage.called).to.be.true;
    });
  });
  
  suite('Test navigateToComponentFile function', () => {
    let checkFileExists = null as any;
    let openDocument = null as any;

    beforeEach(() => {
      checkFileExists = sinon.stub(utils, "checkFileExists").returns(false);
      openDocument = sinon.stub(utils, "openDocument");
    });
    
    suite('if the current file is the ruby file of a component', () => {   
      
      beforeEach(() => {
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_component.rb');
      });

      test('if view template will be opened', async () => {
        checkFileExists.withArgs("app/components/mock_component.html.erb").returns(true);
            
        await utils.navigateToComponentFile("view");
        
        expect(openDocument.calledWith("app/components/mock_component.html.erb")).to.be.true;    
      });

      
      test('if view template will be opened and a custom template engine is defined', async () => {
        sinon.stub(utils, "getTemplateEngines").returns(["erb", "custom_engine"]);
        checkFileExists.withArgs("app/components/mock_component.html.custom_engine").returns(true);
            
        await utils.navigateToComponentFile("view");
        
        expect(openDocument.calledWith("app/components/mock_component.html.custom_engine")).to.be.true;    
      });

      test("if a view template will be opened but it doesn't exist", async () => {
        const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");

        await utils.navigateToComponentFile("view");
        
        expect(statusBarMessage.called).to.be.true;    
      });
      
      test('if the ruby file of a component will be opened', async () => {
        await utils.navigateToComponentFile("ruby");
        
        expect(openDocument.calledWith("app/components/mock_component.rb")).to.be.true;    
      });

      test('if the rspec file of a component will be opened', async () => {
        checkFileExists.withArgs("spec/components/mock_component_spec.rb").returns(true);

        await utils.navigateToComponentFile("test");
        
        expect(openDocument.calledWith("spec/components/mock_component_spec.rb")).to.be.true;    
      });
    });

    suite("if the component name doesn't include a '_'", () => {   
      beforeEach(() => {
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_name/component.html.erb');
      });

      test('if the ruby file of a component will be opened', async () => {
        await utils.navigateToComponentFile("ruby");
        
        expect(openDocument.calledWith("app/components/mock_name/component.rb")).to.be.true;    
      });

    });

    suite('if the current file is the view file(html.erb) of a component', () => {   
      beforeEach(() => {
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_component.html.erb');
      });

      test('if the ruby file of a component will be opened', async () => {
        await utils.navigateToComponentFile("ruby");
        
        expect(openDocument.calledWith("app/components/mock_component.rb")).to.be.true;    
      });

    });

    suite('if the current file is the view file(html.haml) of a component', () => {   
      beforeEach(() => {
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_component.html.haml');
      });

      test('if the ruby file of a component will be opened', async () => {
        await utils.navigateToComponentFile("ruby");
        
        expect(openDocument.calledWith("app/components/mock_component.rb")).to.be.true;    
      });

    });

    suite('if the current file is the rspec file of a component', () => {   
      beforeEach(() => {
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/spec/components/mock_component_spec.rb');
      });

      test('if the ruby file of a component will be opened', async () => {
        await utils.navigateToComponentFile("ruby");
        
        expect(openDocument.calledWith("app/components/mock_component.rb")).to.be.true;    
      });

    });

    suite('if sidecar directories is used for components', () => {   
      
      beforeEach(() => {
        sinon.stub(utils, "isSidecarUsedForComponents").returns(true);
      });

      test('if a view template(html.erb) will be opened', async () => {
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_component.rb');
        checkFileExists.withArgs("app/components/mock_component/mock_component.html.erb").returns(true);
        
        await utils.navigateToComponentFile("view");
        
        expect(openDocument.calledWith("app/components/mock_component/mock_component.html.erb")).to.be.true;    
      });

      test('if a view template(html.slim) will be opened', async () => {
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_component.rb');
        checkFileExists.withArgs("app/components/mock_component/mock_component.html.slim").returns(true);
        
        await utils.navigateToComponentFile("view");
        
        expect(openDocument.calledWith("app/components/mock_component/mock_component.html.slim")).to.be.true;    
      });

      test('if a ruby file of a component will be opened and a view template(html.erb) is the current file', async () => {
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_component/mock_component.html.erb');
        await utils.navigateToComponentFile("ruby");
        
        expect(openDocument.calledWith("app/components/mock_component.rb")).to.be.true;    
      });

      test('if a ruby file of a component will be opened and a view template(html.slim) is the current file', async () => {
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_component/mock_component.html.slim');
        await utils.navigateToComponentFile("ruby");
        
        expect(openDocument.calledWith("app/components/mock_component.rb")).to.be.true;    
      });
      
      test('if a rspec file of a component will be opened and a view template(html.erb) is the current file', async () => {
        checkFileExists.withArgs("spec/components/mock_component_spec.rb").returns(true);
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_component/mock_component.html.erb');
        await utils.navigateToComponentFile("test");
        
        expect(openDocument.calledWith("spec/components/mock_component_spec.rb")).to.be.true;    
      });

      test('if a rspec file of a component will be opened and a view template(html.slim) is the current file', async () => {
        checkFileExists.withArgs("spec/components/mock_component_spec.rb").returns(true);
        sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/components/mock_component/mock_component.html.slim');
        await utils.navigateToComponentFile("test");
        
        expect(openDocument.calledWith("spec/components/mock_component_spec.rb")).to.be.true;    
      });

    });
  });
  
  suite("Test navigateToControllerFile function", () => {
    test("if the current file is a controller file ", async () => {
      sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/app/controllers/mock_controller.rb');
      sinon.stub(utils, "checkFileExists").withArgs('spec/requests/mock_spec.rb').returns(true);
      
      const openDocument = sinon.stub(utils, "openDocument");
      await utils.navigateToControllerFile("test");
      
      expect(openDocument.calledWith('spec/requests/mock_spec.rb')).to.be.true;    
    });

    test("if the current file is a request test file ", async () => {
      sinon.stub(utils, "getActiveFileName").returns('upper_folder/mock_root_folder/spec/requests/mock_spec.rb');
      
      const openDocument = sinon.stub(utils, "openDocument");
      await utils.navigateToControllerFile("app");
      
      expect(openDocument.calledWith('app/controllers/mock_controller.rb')).to.be.true;    
    });
  });

  test("Test navigateToControllerFileWithAction function", async () => {
    sinon.stub(utils, "findActionAndController").returns({controller: "products", action: "index"});
    
    const openDocument = sinon.stub(utils, "openDocument");
    await utils.navigateToControllerFileWithAction();
    
    expect(openDocument.calledWith("app/controllers/products_controller.rb")).to.be.true;    
  });

  test("Test getTemplateEngines function", async () => {
    sinon.stub(workspace, 'getConfiguration').returns(
      {
        get: sinon.stub().withArgs('templateEngines').returns(["erb", "custom_engine"]),
      } as any
    );
    
    const templateEngines = await utils.getTemplateEngines();
    expect(templateEngines).to.deep.equal(["erb", "custom_engine"]);    
  });

  test("Test checkFileExists function", () => {
    expect(utils.checkFileExists("app/controllers/products_controller.rb")).to.be.true;
    expect(utils.checkFileExists("not_exist_file.rb")).to.be.false;
  });

  suite("Test isSidecarUsedForComponents function", () => {
    test("it will be false as default", () => {
      expect(utils.isSidecarUsedForComponents()).to.be.false;   
    });

    test("it can be changed by help of configuration", () => {
      sinon.stub(workspace, 'getConfiguration').returns(
        {
          get: sinon.stub().withArgs("useViewComponentsSidecar").returns(true),
        } as any
      );

      expect(utils.isSidecarUsedForComponents()).to.be.true;
    });
    
  });

  suite("Test navigateToViewFile function", () => {
    let checkFileExists = null as any;
    let openDocument = null as any;
    
    beforeEach(() => {
      checkFileExists = sinon.stub(utils, "checkFileExists").returns(false);
      sinon.stub(utils, "findActionAndController").returns({controller: "products", action: "index"});
      openDocument = sinon.stub(utils, "openDocument");
    });

    suite("if a custom template engine is not defined", () => {
      suite("if the file extension is 'html'", () => {

        test("if action.html.erb file exists", async () => {
          checkFileExists.withArgs("app/views/products/index.html.erb").returns(true);
          
          await utils.navigateToViewFile("app", "html");
          
          expect(openDocument.calledWith("app/views/products/index.html.erb")).to.be.true;    
        }); 

        test("if action.html.erb file doesn't exist", async () => {
          checkFileExists.withArgs("app/views/products/index.turbo_stream.erb").returns(true);
          
          await utils.navigateToViewFile("app", "html");
          
          expect(openDocument.calledWith("app/views/products/index.turbo_stream.erb")).to.be.true;    
        }); 
      }); 

      test("if file extension is 'turbo_stream'", async () => {
        checkFileExists.withArgs("app/views/products/index.turbo_stream.erb").returns(true);
  
        await utils.navigateToViewFile("app", "turbo_stream");
        
        expect(openDocument.calledWith("app/views/products/index.turbo_stream.erb")).to.be.true;    
      });
    });
    
    suite("if a custom template engine is defined", () => {
      beforeEach(() => {
        sinon.stub(utils, "getTemplateEngines").returns(["erb", "custom_engine"]);
      });

      
      suite("if the file extension is 'html'", () => {

        test("if action.html.custom_engine file exists", async () => {
          checkFileExists.withArgs("app/views/products/index.html.custom_engine").returns(true);
          
          await utils.navigateToViewFile("app", "html");
          
          expect(openDocument.calledWith("app/views/products/index.html.custom_engine")).to.be.true;    
        }); 

        test("if action.html.custom_engine file doesn't exist", async () => {
          checkFileExists.withArgs("app/views/products/index.turbo_stream.custom_engine").returns(true);
          
          await utils.navigateToViewFile("app", "html");
          
          expect(openDocument.calledWith("app/views/products/index.turbo_stream.custom_engine")).to.be.true;    
        }); 
      }); 

      test("if file extension is 'turbo_stream'", async () => {
        checkFileExists.withArgs("app/views/products/index.turbo_stream.custom_engine").returns(true);
  
        await utils.navigateToViewFile("app", "turbo_stream");
        
        expect(openDocument.calledWith("app/views/products/index.turbo_stream.custom_engine")).to.be.true;    
      });
    });

    suite("if any file with the first template engine isn't found", () => {
      suite("if the file extension is 'html'", () => {

        test("if action.html.slim file exists", async () => {
          checkFileExists.withArgs("app/views/products/index.html.slim").returns(true);
          
          await utils.navigateToViewFile("app", "html");
          
          expect(openDocument.calledWith("app/views/products/index.html.slim")).to.be.true;    
        }); 

        test("if action.html.slim file doesn't exist", async () => {
          checkFileExists.withArgs("app/views/products/index.turbo_stream.slim").returns(true);
          
          await utils.navigateToViewFile("app", "html");
          
          expect(openDocument.calledWith("app/views/products/index.turbo_stream.slim")).to.be.true;    
        }); 
      }); 

      test("if file extension is 'turbo_stream'", async () => {
        checkFileExists.withArgs("app/views/products/index.turbo_stream.slim").returns(true);
  
        await utils.navigateToViewFile("app", "turbo_stream");
        
        expect(openDocument.calledWith("app/views/products/index.turbo_stream.slim")).to.be.true;    
      });
    });
    
    test("if there is no any valid file", async () => {
      const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");

      await utils.navigateToViewFile("app", "turbo_stream");
      
      expect(statusBarMessage.called).to.be.true;    
      expect(openDocument.called).to.be.false;    
    });
  });
});
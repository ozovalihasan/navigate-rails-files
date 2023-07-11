import { window, commands, Uri, workspace, Range, TextEditor } from 'vscode';
import * as vscode from 'vscode';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as utils from '../../utils';
import * as path from 'path'
import { afterEach, beforeEach } from 'mocha';

const testFolderLocation = "/../../../src/test/suite/example"

const fullPathForTests = (filePath: string) => (path.resolve(__dirname + testFolderLocation + filePath))

const openFileForTests = async(filePath: string = '/app/controllers/products_controller.rb') => {
	const uri = Uri.file(
		path.join(__dirname + testFolderLocation + filePath)
	)
	
	const document = await workspace.openTextDocument(uri)
	await window.showTextDocument(document)
	
}

suite('Utils Test Suite', () => {
	beforeEach(() => {
        commands.executeCommand('workbench.action.closeActiveEditor')

    });

	afterEach(() => {
        commands.executeCommand('workbench.action.closeActiveEditor')
		sinon.restore();
    });

	
	window.showInformationMessage('Start all tests.');

    test('Test isViewRelatedFile function', () => {
        expect(utils.isViewRelatedFile('app/controllers/products_controller.rb')).to.be.true
        expect(utils.isViewRelatedFile('app/views/products/index.html.erb')).to.be.true
        expect(utils.isViewRelatedFile('spec/views/products/index.html.erb_spec.rb')).to.be.true
        expect(utils.isViewRelatedFile('app/views/products/index.turbo_stream.erb')).to.be.true
        expect(utils.isViewRelatedFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.true
        
        expect(utils.isViewRelatedFile('app/models/product.rb')).to.be.false
        expect(utils.isViewRelatedFile('spec/models/product_spec.rb')).to.be.false
    });

    test('Test isViewFile function', () => {
        expect(utils.isViewFile('app/views/products/index.html.erb')).to.be.true
        expect(utils.isViewFile('spec/views/products/index.html.erb_spec.rb')).to.be.true
        expect(utils.isViewFile('app/views/products/index.turbo_stream.erb')).to.be.true
        expect(utils.isViewFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.true
        
        expect(utils.isViewFile('app/controllers/products_controller.rb')).to.be.false
        expect(utils.isViewFile('app/models/product.rb')).to.be.false
        expect(utils.isViewFile('spec/models/product_spec.rb')).to.be.false
    });

    test('Test isControllerFile function', () => {
        expect(utils.isControllerFile('app/controllers/products_controller.rb')).to.be.true
        
        expect(utils.isControllerFile('app/models/product.rb')).to.be.false
        expect(utils.isControllerFile('spec/models/product_spec.rb')).to.be.false
        expect(utils.isControllerFile('app/views/products/index.html.erb')).to.be.false
        expect(utils.isControllerFile('spec/views/products/index.html.erb_spec.rb')).to.be.false
        expect(utils.isControllerFile('app/views/products/index.turbo_stream.erb')).to.be.false
        expect(utils.isControllerFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.false
    });

    test('Test isHTMLViewFile function', () => {
        expect(utils.isHTMLViewFile('app/views/products/index.html.erb')).to.be.true
        expect(utils.isHTMLViewFile('spec/views/products/index.html.erb_spec.rb')).to.be.true
        
        expect(utils.isHTMLViewFile('app/controllers/products_controller.rb')).to.be.false
        expect(utils.isHTMLViewFile('app/models/product.rb')).to.be.false
        expect(utils.isHTMLViewFile('spec/models/product_spec.rb')).to.be.false
        expect(utils.isHTMLViewFile('app/views/products/index.turbo_stream.erb')).to.be.false
        expect(utils.isHTMLViewFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.false
    });

    test('Test isTurboStreamViewFile function', () => {
        expect(utils.isTurboStreamViewFile('app/views/products/index.turbo_stream.erb')).to.be.true
        expect(utils.isTurboStreamViewFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.true

        expect(utils.isTurboStreamViewFile('app/controllers/products_controller.rb')).to.be.false
        expect(utils.isTurboStreamViewFile('app/models/product.rb')).to.be.false
        expect(utils.isTurboStreamViewFile('spec/models/product_spec.rb')).to.be.false
        expect(utils.isTurboStreamViewFile('app/views/products/index.html.erb')).to.be.false
        expect(utils.isTurboStreamViewFile('spec/views/products/index.html.erb_spec.rb')).to.be.false
    });

    test('Test isModelFile function', () => {
        expect(utils.isModelFile('app/models/product.rb')).to.be.true
        expect(utils.isModelFile('spec/models/product_spec.rb')).to.be.true
        
        expect(utils.isModelFile('app/controllers/products_controller.rb')).to.be.false
        expect(utils.isModelFile('app/views/products/index.html.erb')).to.be.false
        expect(utils.isModelFile('spec/views/products/index.html.erb_spec.rb')).to.be.false
        expect(utils.isModelFile('app/views/products/index.turbo_stream.erb')).to.be.false
        expect(utils.isModelFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.false
    });

    test('Test isTestFile function', () => {
        expect(utils.isTestFile('spec/models/product_spec.rb')).to.be.true
        expect(utils.isTestFile('spec/views/products/index.html.erb_spec.rb')).to.be.true
        expect(utils.isTestFile('spec/views/products/index.turbo_stream.erb_spec.rb')).to.be.true
        
        expect(utils.isTestFile('app/controllers/products_controller.rb')).to.be.false
        expect(utils.isTestFile('app/models/product.rb')).to.be.false
        expect(utils.isTestFile('app/views/products/index.turbo_stream.erb')).to.be.false
        expect(utils.isTestFile('app/views/products/index.html.erb')).to.be.false
    });

    suite("Test findActionAndController function", () => {
        test('for a view', async () => {
            await openFileForTests('/app/views/products/index.html.erb')
        
            const [controller, action] = utils.findActionAndController();
            expect(controller).to.be.equal('products')
            expect(action).to.be.equal('index')
        });

        test('for a controller', async () => {
            await openFileForTests('/app/controllers/products_controller.rb')

            let controller : string = "";
            let action : string = "";
            
            utils.moveCursorToStr('A point above the action "index"');
            [controller, action] = utils.findActionAndController();
            expect(controller).to.be.equal('products')
            expect(action).to.be.equal('')

            utils.moveCursorToStr('A point in the action "index"');
            [controller, action] = utils.findActionAndController();
            expect(controller).to.be.equal('products')
            expect(action).to.be.equal('index')

            utils.moveCursorToStr('A point below the action "index"');
            [controller, action] = utils.findActionAndController();
            expect(controller).to.be.equal('products')
            expect(action).to.be.equal('index')
        });
    })


    test('Test findEditor function', async () => {
        await openFileForTests('/app/controllers/products_controller.rb')
        
        let editor = utils.findEditor();
        expect(editor).to.be.ok
    });

    suite('Test findModelName function', () => {
        test('for model file', async () => {
            await openFileForTests('/app/models/product.rb')

            expect(utils.findModelName()).to.be.equal("product")
        });

        test('for test file', async () => {
            await openFileForTests('/spec/models/product_spec.rb')

            expect(utils.findModelName()).to.be.equal("product")
        });
    })

    test('Test inActionBlock function', async () => {
        await openFileForTests('/app/controllers/products_controller.rb')

        utils.moveCursorToStr('A point above the action "index"');
        expect(utils.inActionBlock("index")).to.be.false

        utils.moveCursorToStr('A point in the action "index"');
        expect(utils.inActionBlock("index")).to.be.true

        utils.moveCursorToStr('A point below the action "index"');
        expect(utils.inActionBlock("index")).to.be.false
        
        utils.moveCursorToStr('A point below the action "show"');
        expect(utils.inActionBlock("show")).to.be.false
    });

    test('Test moveCursorToStr function', async () => {
        await openFileForTests('/app/controllers/products_controller.rb')

        const editor = utils.findEditor();
        if (!editor) { return; }

        utils.moveCursorToStr('ProductsController');
        let cursorPosition = editor.selection.active; 
        let fileTextToCursor = editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));

        expect(fileTextToCursor.endsWith('ProductsController')).to.be.true

        utils.moveCursorToStr('A point above the action "index"');
        cursorPosition = editor.selection.active; 
        fileTextToCursor = editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));

        expect(fileTextToCursor.endsWith('A point above the action "index"')).to.be.true
    });

    suite('Test moveCursorToAction function', () => {
        test('if cursor is in the action block', () => {
            const inActionBlock = sinon.stub(utils, "inActionBlock").returns(true);
            const moveCursorToStr = sinon.stub(utils, "moveCursorToStr");

            utils.moveCursorToAction("mock_action")
            expect(inActionBlock.calledOnce).to.be.true;
            expect(moveCursorToStr.called).to.be.false;
        });

        test('if cursor is not in the action block', () => {
            const inActionBlock = sinon.stub(utils, "inActionBlock").returns(false);
            const moveCursorToStr = sinon.stub(utils, "moveCursorToStr");

            utils.moveCursorToAction("mock_action")
            expect(inActionBlock.calledOnce).to.be.true;
            expect(moveCursorToStr.calledWith("def mock_action")).to.be.true;
        });

    })

    test('Test getProjectRoot function', () => {
        sinon.stub((window.activeTextEditor as TextEditor).document.uri, "path").value("mock_project_root_folder/app/controllers/product_controller.rb");

        utils.getProjectRoot()
        expect(utils.getProjectRoot()).to.equal("mock_project_root_folder/");
    });

    suite('Test openDocument function ', () => {
        test('for an invalid document', async () => {
            const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");

            await utils.openDocument(__dirname + testFolderLocation + "/invalid_document_name");
            expect(statusBarMessage.calledOnce).to.be.true;
        });
        
        test('for a document already opened', async () => {
            const filePath = '/app/controllers/products_controller.rb'
            await openFileForTests(filePath)

            const editor = utils.findEditor();
            if (!editor) { return; }
            
            const statusBarMessage = sinon.stub(window, "setStatusBarMessage");

            await utils.openDocument(__dirname + testFolderLocation + filePath);
            expect(statusBarMessage.calledOnce).to.be.true;
        });
        
        test('for a document', async () => {
            const filePath = '/app/models/product.rb'
            const spy = sinon.spy();

            await utils.openDocument(__dirname + testFolderLocation + filePath, spy);
            expect(spy.calledOnce).to.be.true;
        });
    })

    suite('Test changeToFileForModelFiles function', () => {
        test('if a model exists', async () => {
            sinon.stub(utils, "findModelName").returns("product");
            const openDocument = sinon.stub(utils, "openDocument");

            await utils.changeToFileForModelFiles("app/models", ".rb");
            expect(openDocument.called).to.be.true;
        });

        test("if a model doesn't exist", async () => {
            sinon.stub(utils, "findModelName");
            const statusBarMessage = sinon.stub(vscode.window, "setStatusBarMessage");

            await utils.changeToFileForModelFiles("app/models", ".rb");
            expect(statusBarMessage.called).to.be.true;
        });
    })
    
    test("Test changeToFileForControllerFiles function", async () => {
        await openFileForTests('/app/views/products/index.html.erb')
        
        const openDocument = sinon.stub(utils, "openDocument");
        await utils.changeToFileForControllerFiles();
        
        expect(openDocument.calledWith(fullPathForTests("/app/controllers/products_controller.rb"))).to.be.true;     
    });

    test("Test checkFileExists function", () => {
        expect(utils.checkFileExists(fullPathForTests("/app/controllers/products_controller.rb"))).to.be.true;
        expect(utils.checkFileExists(fullPathForTests("/not_exist_file.rb"))).to.be.false;
    });

    suite("Test changeToFileForViewFiles function", () => {
        let checkFileExists = null as any;
        let openDocument = null as any;
        
        beforeEach(() => {
            checkFileExists = sinon.stub(utils, "checkFileExists").returns(false)
            sinon.stub(utils, "findActionAndController").returns(["products", "index"]);
            openDocument = sinon.stub(utils, "openDocument");
            sinon.stub(utils, "getProjectRoot").returns("mock_root_folder/");
        })

        suite("if a custom template engine is not defined", () => {
            suite("if the file extension is 'html'", () => {

                test("if action.html.erb file exists", async () => {
                    checkFileExists.withArgs("mock_root_folder/app/views/products/index.html.erb").returns(true);
                    
                    await utils.changeToFileForViewFiles("app", "html");
                    
                    expect(openDocument.calledWith("mock_root_folder/app/views/products/index.html.erb")).to.be.true;     
                }); 

                test("if action.html.erb file doesn't exist", async () => {
                    checkFileExists.withArgs("mock_root_folder/app/views/products/index.turbo_stream.erb").returns(true);
                    
                    await utils.changeToFileForViewFiles("app", "html");
                    
                    expect(openDocument.calledWith("mock_root_folder/app/views/products/index.turbo_stream.erb")).to.be.true;     
                }); 
            }); 

            test("if file extension is 'turbo_stream'", async () => {
                checkFileExists.withArgs("mock_root_folder/app/views/products/index.turbo_stream.erb").returns(true);
    
                await utils.changeToFileForViewFiles("app", "turbo_stream");
                
                expect(openDocument.calledWith("mock_root_folder/app/views/products/index.turbo_stream.erb")).to.be.true;     
            });

            
        });
        
        suite("if a custom template engine is defined", () => {
            beforeEach(() => {
                sinon.stub(workspace, 'getConfiguration').returns(
                    {
                        get: sinon.stub().withArgs('template-engines').returns(["erb", "custom_engine"]),
                    } as any
                );
            })

            
            suite("if the file extension is 'html'", () => {

                test("if action.html.erb file exists", async () => {
                    checkFileExists.withArgs("mock_root_folder/app/views/products/index.html.custom_engine").returns(true);
                    
                    await utils.changeToFileForViewFiles("app", "html");
                    
                    expect(openDocument.calledWith("mock_root_folder/app/views/products/index.html.custom_engine")).to.be.true;     
                }); 

                test("if action.html.custom_engine file doesn't exist", async () => {
                    checkFileExists.withArgs("mock_root_folder/app/views/products/index.turbo_stream.custom_engine").returns(true);
                    
                    await utils.changeToFileForViewFiles("app", "html");
                    
                    expect(openDocument.calledWith("mock_root_folder/app/views/products/index.turbo_stream.custom_engine")).to.be.true;     
                }); 
            }); 

            test("if file extension is 'turbo_stream'", async () => {
                checkFileExists.withArgs("mock_root_folder/app/views/products/index.turbo_stream.custom_engine").returns(true);
    
                await utils.changeToFileForViewFiles("app", "turbo_stream");
                
                expect(openDocument.calledWith("mock_root_folder/app/views/products/index.turbo_stream.custom_engine")).to.be.true;     
            });

            
        });

        
    })
});
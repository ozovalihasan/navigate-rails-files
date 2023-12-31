import { window, Range, Selection, Position, workspace, TextEditor, Uri } from 'vscode';
import * as fs from 'fs';

export const navigateToModelFile = async (folderName: "app" | "test") => {
  const modelName = findModelName();
  if (!modelName) { 
    window.setStatusBarMessage("There is no a model name", 1000);
  } else {
    if (folderName === "app") {
      await openDocument("app/models/" + modelName + ".rb");
    } else {
      await openTestFile("models/" + modelName);
    }
    
  }
};

export const openTestFile = async (halfPath: string) => {
  let folderNameAndExtensions = [
    {folderName: "spec/", fileExtension: "_spec.rb"}
  ];

  for (let {folderName, fileExtension} of folderNameAndExtensions) {
    let fullPath = folderName + halfPath + fileExtension;
    
    if (checkFileExists(fullPath)) {
      await openDocument(fullPath);
      return true;
    };
  }

  return false;
};

export const getControllerName = () => {
  return findActionAndController().controller;
};

export const navigateToControllerFile = async (fileType: "app" | "test") => {
  if (fileType === "app"){
    await openDocument("app/controllers/" + getControllerName() + "_controller.rb");
  } else {
    let filePath = "spec/requests/" + getControllerName() + "_spec.rb";
    
    if (checkFileExists(filePath)) {
      await openDocument(filePath);
      return;
    } 

    window.setStatusBarMessage("A test file for the controller couldn't be found", 1000);
  };
};

export const navigateToControllerFileWithAction = async () => {
  const {controller, action} = findActionAndController();
  await openDocument(`app/controllers/${controller}_controller.rb`, () => moveCursorToAction(action));
};

export const findModelName = () => (
  getActiveFileName()?.match(/.*\/(app|spec)\/models\/(?<modelName>.*?)(_spec\.rb|\.rb)/)?.groups?.modelName || ""
);

export const openDocument = async (filePath: string, callback: Function | null = null) => {
  const fullPath = getProjectRoot() + filePath;
  
  if (!checkFileExists(filePath)) {
    window.setStatusBarMessage(`Your file(${fullPath}) doesn't exist.`, 1000);  
    return;
  }
      
  if (getActiveFileName() === fullPath) {
    window.setStatusBarMessage("The requested page is already opened.", 1000);
  }
      
  try {
    const document = await workspace.openTextDocument(fullPath);
    await window.showTextDocument(document);
    
    if (callback) { callback(); }
  } catch (e) {
    window.setStatusBarMessage("The file couldn't be opened.", 1000);
  }
};

export const getProjectRoot = () => (
  getActiveFileName()?.match(/(?<projectRoot>.*\/)(app|spec)\/(models|views|controllers|requests|components)/)?.groups?.projectRoot
);

export const setRegExp = (...arr: (string|RegExp|(string|RegExp)[])[]) => (
  new RegExp(
    arr.map((chunk) => {
      if (chunk instanceof RegExp) {
        return chunk.source;
      } else if (chunk instanceof Array) {
        chunk = chunk.map((el: string | RegExp ) => {
                  if (el instanceof RegExp ){
                    return el.source;
                  } else {
                    return el;
                  }
                });
        return "(" + chunk.join("|") + ")";
      } else {
        return chunk;
      }
    }).join("")
  )
);

export const isViewRelatedFile = (fileName: string) : Boolean => (isViewFile(fileName) || isControllerFile(fileName));

export const isViewFile = (fileName: string) => (isHTMLViewFile(fileName) || isTurboStreamViewFile(fileName));

export const isControllerFile = (fileName: string) => Boolean(fileName.match(/app\/controllers\/.*_controller.rb/));

export const isControllerTestFile = (fileName: string) => Boolean(fileName.match( /(spec\/requests\/.*_spec.rb)/ ));

export const isHTMLViewFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/views\/.*\.html\./));

export const isTurboStreamViewFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/views\/.*\.turbo_stream\./));

export const isModelFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/models/));

export const isTestFile = (fileName: string) => Boolean(fileName.match(/(spec)\/.*(_spec.rb)/));

export const isComponentFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/components/));

export const moveCursorToStr = (str: string) => {
  const editor = findEditor();

  if (editor) { 
    const document = editor.document;
    const wordPosition = document.positionAt(document.getText().indexOf(str));
    const newPosition = new Position(wordPosition.line, wordPosition.character + str.length);
    editor.selection = new Selection(newPosition, newPosition);
   }
};

export const findEditor = (): TextEditor | undefined => {
  const editor = window.activeTextEditor;
  if (!editor) {
    window.showErrorMessage('No active text editor');
    return;
  }

  return editor;
};

export const moveCursorToAction = (action: string) => {
  if (! inActionBlock(action)) { 
    moveCursorToStr(`def ${action}`); 
  }
};

export const getTextUntilCursor = () => {
  const editor = findEditor();
  if (!editor) { return ""; }

  const cursorPosition = editor.selection.active; 
  return editor.document.getText(new Range(0, 0, cursorPosition.line, cursorPosition.character));
};

export const inActionBlock = (action: string) => {
  const fileTextToCursor = getTextUntilCursor();

  if ( fileTextToCursor.match( setRegExp(/(\s*)def\s*/, action, /\s*\n(.*\n)*\1end/) ) ) { 
    return false;
  } else if ( fileTextToCursor.match( setRegExp(/(\s*)def\s*/, action, /\s*;\s*end/) ) ) { 
    return false;
  } else if ( fileTextToCursor.match( setRegExp(/(\s*)def\s*/, action) ) ) { 
    return true;
  } else {
    return false;
  }
      
};

export const findActionAndController = () => {
  let [action, controller] = ["", ""];

  let activeFileName = getActiveFileName();
  if (!activeFileName) { return {action, controller}; }

  if (isControllerTestFile(activeFileName)) {

    controller = (
      activeFileName.match(/spec\/requests\/(?<controller>.*)_spec.rb$/)?.groups?.controller || 
      ""
    );
    
    
  } else if ( isControllerFile(activeFileName) ) {
    
    const fileTextToCursor = getTextUntilCursor();

    action = fileTextToCursor.match(/def\s*(?<action>\w+)(?!.*def\s*\w+)/s)?.groups?.action || "";
    if (!action && !inActionBlock(action)) {
      window.setStatusBarMessage('Please select an action block', 1000); 
      action = "";
    }

    controller = activeFileName.match(/app\/controllers\/(?<controller>.*)_controller.rb$/)?.groups?.controller || "";
    
  } else if ( isViewFile(activeFileName) ) {

    (
      {controller, action} = activeFileName.match(
        /(app|spec)\/views\/(?<controller>.*)\/(?<action>\w+)\.(turbo_stream|html)\./ 
      )?.groups || {controller: "", action: ""}
    );
    
  } else {
    window.setStatusBarMessage('There is no an action or a controller.', 1000); 
  }
      
  return {action, controller};
};

export const getTemplateEngines = () => workspace.getConfiguration('navigateRailsFiles').get("templateEngines") as string[];

export const getActiveFileName = () => {
  return findEditor()?.document.fileName;
};

export const isSidecarUsedForComponents = () => workspace.getConfiguration('navigateRailsFiles').get("useViewComponentsSidecar") as boolean;

export const navigateToComponentFile = async (fileType: "ruby" | "view" | "test") => {
  let activeFileName = getActiveFileName();
  if (!activeFileName) {return;}
      
  let componentName = activeFileName.match(/\/(app|spec)\/(?<componentName>.*?)(_spec\.rb|\.html|\.rb)/)?.groups?.componentName || "";
  
  if (isSidecarUsedForComponents()) {
    if (activeFileName.match(/\.html\./) && activeFileName.match(/(\/\w+)\1/)) {
      componentName = componentName.replace(/\/\w+$/, "");
    }

    if (fileType === "view") {
      componentName = componentName.replace(/(\/\w+)$/, "$1$1");
    }
  }
      
  if (fileType === "view") {
    const templateEngines = getTemplateEngines();

    for (let templateEngine of templateEngines) {
      let fullPathWithTemplateEngine = `app/${componentName}.html.${templateEngine}`;
      
      if (checkFileExists(fullPathWithTemplateEngine)) {
        await openDocument(fullPathWithTemplateEngine);
        return;
      };
    };

    window.setStatusBarMessage("Any valid view file couldn't be found.", 1000);

  } else if (fileType === "test"){

    if (!(await openTestFile(componentName))) {
      window.setStatusBarMessage("A test file for the component couldn't be found.", 1000);
    }

  } else if (fileType === "ruby"){
    await openDocument("app/" + componentName + ".rb");
  };
};


export const navigateToViewFile = async (folderName: "app" | "test", viewType: "html" | "turbo_stream") => {
  const {controller, action} = findActionAndController();
  if (!action){ 
    window.setStatusBarMessage("An action couldn't be found", 1000);

    return; 
  }

  let fullPath = "";
  const templateEngines = getTemplateEngines();
 
  let viewTypes = viewType === "html" ? ( ["html", "turbo_stream"] as const ) : ( ["turbo_stream"] as const );
  
  for (let viewType of viewTypes) {
    for (let templateEngine of templateEngines) {
      fullPath = `views/${controller}/${action}.${viewType}.${templateEngine}`;

      if (folderName === 'app') {
        
        fullPath = "app/" + fullPath;
        
        if (checkFileExists(fullPath)) {
          await openDocument(fullPath);
          return;
        }      

      } else {

        if(await openTestFile(fullPath)) {
          return;
        }
        
      }
      
    }
  };

  window.setStatusBarMessage("Any valid view file couldn't be found.", 1000);
};

export const checkFileExists = (filePath: string): boolean => {
  return fs.existsSync(getProjectRoot() + filePath);
};
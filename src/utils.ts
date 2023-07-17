import { window, Range, Selection, Position, workspace, TextEditor, Uri } from 'vscode';
import {resolve} from "path";
import * as fs from 'fs';

export const changeToFileForModelFiles = async (folderName: "app" | "spec") => {
  const modelName = findModelName();
  if (!modelName) { 
    window.setStatusBarMessage("There is no a model name", 1000);
    return; 
  }
  const projectRoot = getProjectRoot();
      
  await openDocument(projectRoot + folderName + "/models/" + modelName + (folderName === "app" ? ".rb" : "_spec.rb"));
};

export const getControllerName = () => {
  let activeFileName = getActiveFileName();
  if (!activeFileName) {return;}
      
  return activeFileName.match(
    /(spec\/requests|app\/controllers)\/(?<controllerName>.*)(_spec.rb|_controller.rb)$/
  )?.groups?.controllerName;
}

export const changeToFileForControllerFiles = async (fileType: "app" | "test") => {
  let fullPath = "";
      
  if (fileType === "app"){
    fullPath = getProjectRoot() + "app/controllers/" + getControllerName() + "_controller.rb";
  } else {
    fullPath = getProjectRoot() + "spec/requests/" + getControllerName() + "_spec.rb";
  }

  await openDocument(fullPath);
};

export const changeToFileForControllerFilesWithAction = async () => {
  let [controller, action] = findActionAndController();
  if (!controller || !action){ return; }
      
  const workspaceFolder = getProjectRoot();
      
  await openDocument(workspaceFolder + "app/controllers/" + controller + "_controller.rb", () => moveCursorToAction(action));
};

export const findModelName = () => (
  getActiveFileName()?.match(/.*\/(spec|app)\/models\/(?<modelName>.*?)(_spec\.rb|\.rb)/)?.groups?.modelName || ""
);

export const openDocument = async (filePath: string, callback: Function | null = null) => {
  if (!checkFileExists(filePath)) {
    window.setStatusBarMessage(`Your file(${filePath}) doesn't exist.`, 1000);  
    return;
  }
      
  if (getActiveFileName() === resolve(filePath)) {
    window.setStatusBarMessage("The requested page is already opened.", 1000);
  }
      
  try {
    const document = await workspace.openTextDocument(filePath);
    await window.showTextDocument(document);
    
    if (callback) { callback(); }
  } catch (e) {
    window.setStatusBarMessage("The file couldn't be opened.", 1000);
  }
};

export const getProjectRoot = () => {
  const activeFilePath = getActiveFileName();

  return (activeFilePath?.match(/(?<projectRoot>.*\/)(app|spec)\/(models|views|controllers|requests|components)/)?.groups?.projectRoot);
};

export const setRegExp = (...arr: (string|RegExp|(string|RegExp)[])[]) => (
  new RegExp(
    arr.map((chunk) => {
      if (chunk instanceof RegExp) {
        return chunk.source;
      } else if (chunk instanceof Array) {
        chunk = chunk.map((el: string | RegExp ) => {
                  if (el instanceof RegExp ){
                    return el.source
                  } else {
                    return el
                  }
                })
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

export const isControllerTestFile = (fileName: string) => Boolean(fileName.match( /spec\/requests\/.*_spec.rb/ ));

export const isHTMLViewFile = (fileName: string) => Boolean(
  fileName.match( setRegExp( /(app|spec)\/views\/.*\.html\./, getTemplateEngines() ) )
);

export const isTurboStreamViewFile = (fileName: string) => Boolean(
  fileName.match(
    setRegExp( /(app|spec)\/views\/.*\.turbo_stream\./, getTemplateEngines() )
  )
);

export const isModelFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/models/));

export const isTestFile = (fileName: string) => Boolean(fileName.match(/spec\/.*_spec.rb/));

export const isComponentFile = (fileName: string) => Boolean(fileName.match(/(app|spec)\/components/));

export const moveCursorToStr = (str: string) => {
  const editor = findEditor();
  if (!editor) { return; }

  const document = editor.document;
  const wordPosition = document.positionAt(document.getText().indexOf(str));
  const newPosition = new Position(wordPosition.line, wordPosition.character + str.length);
  editor.selection = new Selection(newPosition, newPosition);
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
  if (inActionBlock(action)) { return; }

  moveCursorToStr(`def ${action}`);
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
  let activeFileName = getActiveFileName();
  if (!activeFileName) { return ["", ""]; }
      
  let [action, controller] = ["", ""];

  if (isControllerTestFile(activeFileName)) {

    controller = activeFileName.match(/spec\/requests\/(?<controller>.*)_spec.rb$/)?.groups?.controller || "";
    
  } else if ( isControllerFile(activeFileName) ) {
    const fileTextToCursor = getTextUntilCursor();
    
    action = fileTextToCursor.match(/def\s*(?<action>\w+)(?!.*def\s*\w+)/s)?.groups?.action || "";

    controller = activeFileName.match(/app\/controllers\/(?<controller>.*)_controller.rb$/)?.groups?.controller || "";
    
  } else if ( isViewFile(activeFileName) ) {
    (
      {controller, action} = activeFileName.match(
        setRegExp(
          /(app|spec)\/views\/(?<controller>.*)\/(?<action>\w+)\.(turbo_stream|html)\./, 
          getTemplateEngines(),
          /(_spec\.rb)*/ 
        )
      )?.groups || {controller: "", action: ""}
    );
  } else {
    window.setStatusBarMessage('There is no an action or a controller.', 1000); 
    return ["", ""];
  }
      
  return [controller, action];
};

export const getTemplateEngines = () => workspace.getConfiguration('navigate-rails-files').get("template-engines") as string[];

export const getActiveFileName = () => {
  const editor = findEditor();
  if (!editor) { return; }
      
  return editor.document.fileName;
};

export const isSidecarUsedForComponents = () => workspace.getConfiguration('navigate-rails-files').get("use-view-components-sidecar") as boolean;

export const changeToFileForComponents = async (fileExtension: ".rb" | ".html" | "_spec.rb") => {
  let folderName = "";
  switch(fileExtension) {
    case ".rb":
    case ".html":
      folderName = "app/";
      break;
    case "_spec.rb":
      folderName = "spec/";
      break;
  } 
      
  let activeFileName = getActiveFileName();
  if (!activeFileName) {return;}
      
  let componentName = activeFileName.match(/\/(app|spec)\/(?<componentName>.*?)(_spec\.rb|\.html|\.rb)/)?.groups?.componentName || "";
  
  const useSidecar = isSidecarUsedForComponents();
  if (useSidecar ) {
    if (activeFileName.match(/\.html\./) && activeFileName.match(/(\/\w+)\1/)) {
      componentName = componentName.replace(/\/\w+$/, "");
    }

    if (fileExtension === ".html") {
      componentName = componentName.replace(/(\/\w+)$/, "$1$1");
    }
  }
      
  const projectRoot = getProjectRoot()
  let fullPath = projectRoot + folderName + componentName + fileExtension;
  
  if (fileExtension === ".html") {
    const templateEngines = getTemplateEngines();

    for (let templateEngine of templateEngines) {
      let fullPathWithTemplateEngine = fullPath + "." + templateEngine;
      
      if ( checkFileExists(fullPathWithTemplateEngine) ) {
        await openDocument(fullPathWithTemplateEngine);
        
        return;
      }
    };

    window.setStatusBarMessage("Any valid view file couldn't be found.", 1000);
  } else if (fileExtension === ".rb" || (fileExtension === "_spec.rb")){
    await openDocument(fullPath);
  };
};


export const changeToFileForViewFiles = async (folderName: "app" | "spec", fileExtension: "html" | "turbo_stream") => {
  let [controller, action] = findActionAndController();
  if (!controller){ return; }

  const projectRoot = getProjectRoot();
  
  let fullPath = "";
  let setFullPath = (templateEngine: string) => projectRoot + folderName + "/views/" + controller + "/" + action + "." + fileExtension + "." + templateEngine + (folderName === "spec" ? "_spec.rb" : "");
  const templateEngines = getTemplateEngines();
      
  for (let templateEngine of templateEngines) {
    fullPath = setFullPath(templateEngine);
    
    if (fileExtension === "html") {
    
      const isFileExist = checkFileExists(fullPath);
      if (!isFileExist) {
        fullPath = fullPath.replace("html", "turbo_stream");
      };
    };
    
    if ( checkFileExists(fullPath) ) {
      await openDocument(fullPath);
      return;
    }

  };

  window.setStatusBarMessage("Any valid view file couldn't be found.", 1000);
};

export const checkFileExists = (filePath: string): boolean => {
  return fs.existsSync(filePath);
};
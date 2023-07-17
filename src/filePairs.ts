import { changeToFileForComponents, changeToFileForControllerFiles, changeToFileForControllerFilesWithAction, changeToFileForModelFiles, changeToFileForViewFiles, getActiveFileName, isComponentFile, isControllerFile, isModelFile, isRequestTestFile, isTurboStreamViewFile, isViewRelatedFile } from "./utils";

export type PairType = {
    checkFunction: (fileName: string) => Boolean;
    callback: () => Promise<void>;
};

export type PairsType =  PairType[];

export const rbPairs: PairsType = [
    {
        checkFunction: isRequestTestFile, 
        callback : async () => {
            await changeToFileForControllerFiles("app");
        }
    },
    {
        checkFunction: isViewRelatedFile, 
        callback : async () => {
            await changeToFileForControllerFilesWithAction();
        }
    },
    {
        checkFunction: isModelFile, 
        callback:  async () => {
                await changeToFileForModelFiles("app");    
        } 
    },
    {
        checkFunction: isComponentFile, 
        callback : async () => {
            await changeToFileForComponents(".rb");
        }
    },
];

export const htmlPairs: PairsType = [
    {
        checkFunction: isViewRelatedFile, 
        callback : async () => {
            await changeToFileForViewFiles("app", "html");
        }
    },
    {
        checkFunction: isComponentFile, 
        callback : async () => {
            await changeToFileForComponents(".html");
        }
    },
];

export const turboStreamPairs: PairsType = [
    {
        checkFunction: isViewRelatedFile, 
        callback : async () => {
            await changeToFileForViewFiles("app", "turbo_stream");
        }
    },
];

export const rspecPairs: PairsType = [
    {
        checkFunction: isControllerFile, 
        callback : async () => {
            await changeToFileForControllerFiles("spec");
        }
    },
    {
        checkFunction: (activeFileName) => isViewRelatedFile(activeFileName) && isTurboStreamViewFile(activeFileName), 
        callback : async () => {
            await changeToFileForViewFiles("spec", "turbo_stream");
        }
    },
    {
        checkFunction: (activeFileName) => isViewRelatedFile(activeFileName) && !isTurboStreamViewFile(activeFileName), 
        callback : async () => {
            await changeToFileForViewFiles("spec", "html");
        }
    },
    {
        checkFunction: isModelFile, 
        callback : async () => {
            await changeToFileForModelFiles("spec");
        }
    },
    {
        checkFunction: isComponentFile, 
        callback : async () => {
            await changeToFileForComponents("_spec.rb");
        }
    },
];

import { changeToFileForControllerFiles, changeToFileForModelFiles, changeToFileForViewFiles, isModelFile, isTurboStreamViewFile, isViewRelatedFile } from "./utils"

export type PairType = {
    checkFunction: (fileName: string) => Boolean;
    callback: () => Promise<void>;
}

export type PairsType =  PairType[]

export const rbPairs: PairsType = [
    {
        checkFunction: isViewRelatedFile, 
        callback : async () => {
            await changeToFileForControllerFiles()
        }
    },
    {
        checkFunction: isModelFile, 
        callback:  async () => {
                await changeToFileForModelFiles("app");    
        } 
    }
]

export const htmlPairs: PairsType = [
    {
        checkFunction: isViewRelatedFile, 
        callback : async () => {
            await changeToFileForViewFiles("app", "html")
        }
    },
]

export const turboStreamPairs: PairsType = [
    {
        checkFunction: isViewRelatedFile, 
        callback : async () => {
            await changeToFileForViewFiles("app", "turbo_stream")
        }
    },
]

export const rspecPairs: PairsType = [
    {
        checkFunction: (activeFileName) => isViewRelatedFile(activeFileName) && isTurboStreamViewFile(activeFileName), 
        callback : async () => {
            await changeToFileForViewFiles("spec", "turbo_stream")
        }
    },
    {
        checkFunction: (activeFileName) => isViewRelatedFile(activeFileName) && !isTurboStreamViewFile(activeFileName), 
        callback : async () => {
            await changeToFileForViewFiles("spec", "html")
        }
    },
    {
        checkFunction: isModelFile, 
        callback : async () => {
            await changeToFileForModelFiles("spec")
        }
    },
]

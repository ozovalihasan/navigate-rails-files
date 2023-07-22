import { navigateToComponentFile, navigateToControllerFile, navigateToControllerFileWithAction, navigateToModelFile, navigateToViewFile, getActiveFileName, isComponentFile, isControllerFile, isModelFile, isControllerTestFile, isTurboStreamViewFile, isViewRelatedFile } from "./utils";

export type PairType = {
  checkFunction: (fileName: string) => Boolean;
  callback: () => Promise<void>;
};

export type PairsType =  PairType[];

export const rbPairs: PairsType = [
  {
    checkFunction: isControllerTestFile, 
    callback : async () => {
      await navigateToControllerFile("app");
    }
  },
  {
    checkFunction: isViewRelatedFile, 
    callback : async () => {
      await navigateToControllerFileWithAction();
    }
  },
  {
    checkFunction: isModelFile, 
    callback:  async () => {
        await navigateToModelFile("app");   
    } 
  },
  {
    checkFunction: isComponentFile, 
    callback : async () => {
      await navigateToComponentFile("ruby");
    }
  },
];

export const htmlPairs: PairsType = [
  {
    checkFunction: isViewRelatedFile, 
    callback : async () => {
      await navigateToViewFile("app", "html");
    }
  },
  {
    checkFunction: isComponentFile, 
    callback : async () => {
      await navigateToComponentFile("view");
    }
  },
];

export const turboStreamPairs: PairsType = [
  {
    checkFunction: isViewRelatedFile, 
    callback : async () => {
      await navigateToViewFile("app", "turbo_stream");
    }
  }
];

export const rspecPairs: PairsType = [
  {
    checkFunction: isControllerFile, 
    callback : async () => {
      await navigateToControllerFile("test");
    }
  },
  {
    checkFunction: (activeFileName) => isViewRelatedFile(activeFileName) && isTurboStreamViewFile(activeFileName), 
    callback : async () => {
      await navigateToViewFile("test", "turbo_stream");
    }
  },
  {
    checkFunction: (activeFileName) => isViewRelatedFile(activeFileName) && !isTurboStreamViewFile(activeFileName), 
    callback : async () => {
      await navigateToViewFile("test", "html");
    }
  },
  {
    checkFunction: isModelFile, 
    callback : async () => {
      await navigateToModelFile("test");
    }
  },
  {
    checkFunction: isComponentFile, 
    callback : async () => {
      await navigateToComponentFile("test");
    }
  },
];

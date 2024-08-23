import { 
  navigateToComponentFile, 
  navigateToControllerFile, 
  navigateToControllerFileWithAction, 
  navigateToModelFile, 
  navigateToViewFile, 
  isComponentFile, 
  isControllerFile, 
  isModelFile, 
  isControllerTestFile, 
  isTurboStreamViewFile, 
  isControllerRelatedFile, 
  isCurrentTextHavingComponent,
  navigateToComponentFileFromCurrentLine, 
  isMailerFile,
  isMailerTestFile,
  isMailerRelatedFile,
  isModelRelatedFile,
  isComponentRelatedFile,
  isControllerOrMailerRelatedFile
} from "./utils";

export type PairType = {
  checkFunction: (fileName: string) => Boolean;
  callback: () => Promise<void>;
};

export type PairsType =  PairType[];

export const rbPairs: PairsType = [
  {
    checkFunction: (_:string) => isCurrentTextHavingComponent(), 
    callback : async () => {
      await navigateToComponentFileFromCurrentLine("ruby");
    }
  },
  {
    checkFunction: (activeFileName) => isControllerTestFile(activeFileName) || isControllerFile(activeFileName) || isMailerTestFile(activeFileName) || isMailerFile(activeFileName),
    callback : async () => {
      await navigateToControllerFile("app");
    }
  },
  {
    checkFunction: (activeFileName) => isControllerRelatedFile(activeFileName) || isMailerRelatedFile(activeFileName),
    callback : async () => {
      await navigateToControllerFileWithAction();
    }
  },
  {
    checkFunction: isModelRelatedFile, 
    callback:  async () => {
        await navigateToModelFile("app");   
    } 
  },
  {
    checkFunction: isComponentRelatedFile, 
    callback : async () => {
      await navigateToComponentFile("ruby");
    }
  },
];

export const htmlPairs: PairsType = [
  {
    checkFunction: (_:string) => isCurrentTextHavingComponent(), 
    callback : async () => {
      await navigateToComponentFileFromCurrentLine("view");
    }
  },
  {
    checkFunction: isControllerOrMailerRelatedFile,
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
    checkFunction: (_:string) => isCurrentTextHavingComponent(), 
    callback : async () => {
      await navigateToComponentFileFromCurrentLine("view");
    }
  },
  {
    checkFunction: isControllerRelatedFile, 
    callback : async () => {
      await navigateToViewFile("app", "turbo_stream");
    }
  }
];

export const rspecPairs: PairsType = [
  {
    checkFunction: (_:string) => isCurrentTextHavingComponent(), 
    callback : async () => {
      await navigateToComponentFileFromCurrentLine("test");
    }
  },
  {
    checkFunction: isControllerRelatedFile, 
    callback : async () => {
      await navigateToControllerFile("test");
    }
  },
  {
    checkFunction: (activeFileName) => isControllerRelatedFile(activeFileName) && isTurboStreamViewFile(activeFileName), 
    callback : async () => {
      await navigateToViewFile("test", "turbo_stream");
    }
  },
  {
    checkFunction: (activeFileName) => isControllerRelatedFile(activeFileName) && !isTurboStreamViewFile(activeFileName), 
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

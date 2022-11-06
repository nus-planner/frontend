import { Module, PrereqTree } from "../interfaces/planner";
import { isValidModuleCode } from "../utils/moduleUtils";

interface ModuleRequisites {
  prereqs?: PrereqTree | null;
  preclusions?: string[] | null;
  coreqs?: string[] | null;
}

interface BasicModuleInfo {
  moduleCode: string;
  title: string;
  moduleCredit: number;
}

const NUSMODS_API_URL = "https://api.nusmods.com/v2";

// If module has prereqs -> return PrereqTree
// If module has no prereqs -> return null
// If error in querying -> return undefined
export const fetchModulePrereqs = async (
  academicYear: string,
  moduleCode: string,
): Promise<ModuleRequisites> => {
  if (!isValidModuleCode(moduleCode)) return {};

  const res = await fetch(
    NUSMODS_API_URL + `/${academicYear}/modules/${moduleCode}.json`,
  ).then((resp) => {
    if (resp.status != 200) {
      return undefined;
    }
    return resp.json();
  });
  if (!res) return {};

  let prereqs: PrereqTree | null = null;
  if (res.prereqTree !== undefined) {
    prereqs = res.prereqTree;
  } else if (res.prerequisite !== undefined) {
    // Workaround for some modules from NUSMods API not having PrereqTrees
    const match: string[] | null = res.prerequisite.match(/[A-Z]+\d{4}[A-Z]*/g);
    if (!!match) {
      prereqs = {
        or: match.filter(
          (x: string) => !x.startsWith("AY") && x !== moduleCode,
        ),
      };
    }
  }

  const preclusions: string[] | null =
    res.preclusion === undefined
      ? null
      : res.preclusion.match(/[A-Z]+\d+[A-Z]*/g);
  const coreqs: string[] | null =
    res.corequisite === undefined
      ? null
      : res.corequisite.match(/[A-Z]+\d+[A-Z]*/g);

  return { prereqs: prereqs, preclusions: preclusions, coreqs: coreqs };
};

export const fetchBasicModuleInfo = async (
  academicYear: string,
  moduleCode: string,
): Promise<BasicModuleInfo | undefined> => {
  if (!isValidModuleCode(moduleCode)) return undefined;

  const res = await fetch(
    NUSMODS_API_URL + `/${academicYear}/modules/${moduleCode}.json`,
  ).then((resp) => {
    if (resp.status != 200) {
      return undefined;
    }
    return resp.json();
  });
  if (!res) return undefined;

  console.log("Fetched basic module info");
  console.log({
    moduleCode: res.moduleCode,
    title: res.title,
    moduleCredit: Number.parseInt(res.moduleCredit),
  });

  return {
    moduleCode: res.moduleCode,
    title: res.title,
    moduleCredit: Number.parseInt(res.moduleCredit),
  };
};

export const fetchModuleList = async (
  academicYear: string,
): Promise<Module[]> => {
  const res = await fetch(
    NUSMODS_API_URL + `/${academicYear}/moduleList.json`,
  ).then((resp) => {
    if (resp.status != 200) {
      return undefined;
    }
    return resp.json();
  });
  let moduleList: Module[] = [];
  if (!res) return moduleList;
  for (let i = 0; i < res.length; i++) {
    moduleList.push({
      id: res[i].moduleCode,
      code: res[i].moduleCode,
      name: res[i].title,
      credits: null,
    });
  }
  return moduleList;
};

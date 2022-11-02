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

// Temporary assignment
const acadYear = "2022-2023";

// If module has prereqs -> return PrereqTree
// If module has no prereqs -> return null
// If error in querying -> return undefined
export const fetchModulePrereqs = async (
  moduleCode: string,
): Promise<ModuleRequisites> => {
  if (!isValidModuleCode(moduleCode)) return {};

  const res = await fetch(
    NUSMODS_API_URL + `/${acadYear}/modules/${moduleCode}.json`,
  ).then((resp) => {
    if (resp.status != 200) {
      return undefined;
    }
    return resp.json();
  });
  if (!res) return {};

  // TODO: Remove
  console.log(res);
  console.log(res?.prereqTree);
  console.log(JSON.stringify(res?.prereqTree));

  const prereqs: PrereqTree | null =
    res.prereqTree === undefined ? null : res.prereqTree;
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
  moduleCode: string,
): Promise<BasicModuleInfo | undefined> => {
  if (!isValidModuleCode(moduleCode)) return undefined;

  const res = await fetch(
    NUSMODS_API_URL + `/${acadYear}/modules/${moduleCode}.json`,
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

export const fetchModuleList = async (): Promise<Module[]> => {
  const res = await fetch(
    NUSMODS_API_URL + `/${acadYear}/moduleList.json`,
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

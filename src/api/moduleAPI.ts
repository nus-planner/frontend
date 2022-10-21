import { Module, PrereqTree } from "../interfaces/planner";

interface ModuleRequisites {
  prereqs?: PrereqTree | null;
  preclusions?: string[] | null;
}

const NUSMODS_API_URL = "https://api.nusmods.com/v2";

// Temporary assignment
const acadYear = "2022-2023";

// If module has prereqs -> return PrereqTree
// If module has no prereqs -> return null
// If error in querying -> return undefined
export const fetchModulePrereqs = async (
  moduleCode: string
): Promise<ModuleRequisites> => {
  const res = await fetch(
    NUSMODS_API_URL + `/${acadYear}/modules/${moduleCode}.json`
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

  let prereqs: PrereqTree | null = res.prereqTree;
  let preclusions: string[] | null = null;

  if (res.prereqTree === undefined) prereqs = null;
  if (res.preclusion === undefined) {
    preclusions = null;
  } else {
    preclusions = res.preclusion.match(/[A-Z]+\d+[A-Z]*/g);
  }

  return { prereqs: prereqs, preclusions: preclusions };
};

export const fetchModuleList = async (): Promise<Module[]> => {
  const res = await fetch(NUSMODS_API_URL + `/${acadYear}/moduleList.json`).then(
    (resp) => {
      if (resp.status != 200) {
        return undefined;
      }
      return resp.json();
    }
  );
  let moduleList: Module[] = [];
  if (!res) return moduleList;
  for (let i = 0; i < res.length; i++) {
    moduleList.push({ code: res[i].moduleCode, name: res[i].title, credits: null});
  }
  return moduleList;
}

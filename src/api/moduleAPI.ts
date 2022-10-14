import { PrereqTree } from "../interfaces/planner";

interface ModuleRequisites {
  prereqs: PrereqTree;
  preclusions: string[];
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
  if (!res) return undefined;

  // TODO: Remove
  console.log(res);
  console.log(res?.prereqTree);
  console.log(JSON.stringify(res?.prereqTree));

  let prereqs: PrereqTree = res.prereqTree;
  let preclusions: string[] = null;

  if (res.prereqTree === undefined) prereqs = null;
  if (res.preclusion === undefined) {
    preclusions = null;
  } else {
    preclusions = res.preclusion.match(/[A-Z]+\d+[A-Z]*/g);
  }

  return { prereqs: prereqs, preclusions: preclusions };
};

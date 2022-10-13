import { PrereqTree } from "../interfaces/planner";

const NUSMODS_API_URL = "https://api.nusmods.com/v2";

// Temporary assignment
const acadYear = "2019-2020";


// If module has prereqs -> return PrereqTree
// If module has no prereqs -> return null
// If error in querying -> return undefined
export const fetchModulePrereqs = async (
  moduleCode: string
): Promise<PrereqTree> => {
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

  if (res.prereqTree === undefined) {
    console.log('return null')
    return null;
  }

  return res.prereqTree;
};

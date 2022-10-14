import { fetchModulePrereqs } from "../api/moduleAPI";
import { moduleColor } from "../constants/moduleColor";
import { Requirement, Semester, PrereqTree } from "../interfaces/planner";

export const addColorToModules = (moduleRequirements: Requirement[]) => {
  return moduleRequirements.map((requirement, idx) => ({
    ...requirement,
    modules: requirement.modules.map((mod) => ({
      ...mod,
      color: moduleColor[idx % moduleColor.length],
    })),
  }));
};

export const applyPrereqValidation = async (
  semesters: Semester[]
): Promise<Semester[]> => {
  const takenModuleSet = new Set<string>();

  for (let i = 0; i < semesters.length; i++) {
    const preclusions: string[] = [];

    for (let j = 0; j < semesters[i].modules.length; j++) {
      let mod = semesters[i].modules[j];
      mod.prereqsViolated = [];

      // Fetch prereqs from NUSMods if property not found
      if (mod.prereqs === undefined) {
        const reqs = await fetchModulePrereqs(mod.code);
        mod.prereqs = reqs.prereqs;
        if (reqs.preclusions !== undefined) {
          mod.preclusions = reqs.preclusions;
        }
      }

      // Handles 2 cases:
      // module.prereqs is still undefined due to error
      // module.prereqs is null (no prereqs)
      if (!!mod.prereqs) {
        mod.prereqsViolated = evaluatePrereqTreeMods(
          mod.prereqs,
          takenModuleSet
        );
        console.log(`Pre-requisites violated for ${mod.code}`);
        console.log(mod.prereqsViolated);
      }
      console.log(mod);
      if (!!mod.preclusions) {
        preclusions.push(...mod.preclusions);
      }
      semesters[i].modules[j] = mod;
    }
    for (let j = 0; j < semesters[i].modules.length; j++) {
      takenModuleSet.add(semesters[i].modules[j].code);
    }
    preclusions.forEach((preclusion) => takenModuleSet.add(preclusion));
  }

  console.log("Apply prereq validation");
  console.log(semesters);

  return semesters;
};

// Returns true if all prerequisites are fulfilled, false otherwise.
const evaluatePrereqTree = (
  prereqTree: PrereqTree,
  moduleSet: Set<string>
): boolean => {
  if (typeof prereqTree === "string") {
    return moduleSet.has(prereqTree);
  }
  if ("and" in prereqTree) {
    return prereqTree.and.every((x) => evaluatePrereqTree(x, moduleSet));
  }
  if ("or" in prereqTree) {
    return prereqTree.or.some((x) => evaluatePrereqTree(x, moduleSet));
  }
};

// Returns null if all prerequisites are fulfilled
// If not, returns in the following format:
// [["CS3243", "CS3245"],["ST2131", "ST2334", "MA2216"]]
// means ("CS3243" OR "CS3245") AND ("ST2131" OR "ST2334" OR "MA2216") required
const evaluatePrereqTreeMods = (
  prereqTree: PrereqTree,
  moduleSet: Set<string>
): string[][] => {
  if (typeof prereqTree === "string") {
    return moduleSet.has(prereqTree) ? null : [[prereqTree]];
  }
  if ("and" in prereqTree) {
    const unfulfilledMods = prereqTree.and
      .map((x) => evaluatePrereqTreeMods(x, moduleSet)?.flat(1))
      .filter((x) => !!x);
    return unfulfilledMods.length ? unfulfilledMods : null;
  }
  if ("or" in prereqTree) {
    const orNotFulfilled = prereqTree.or.every(
      (x) => !!evaluatePrereqTreeMods(x, moduleSet)
    );
    return orNotFulfilled
      ? (prereqTree.or
          .map((x) => evaluatePrereqTreeMods(x, moduleSet))
          .flat(1) as string[][])
      : null;
  }

  return null;
};

export const testPrereqTree = async () => {
  const prereqTree = await fetchModulePrereqs("CS3243");
  const modSet = new Set<string>(["CS2040", "CS1231"]);
  const res = evaluatePrereqTree(prereqTree.prereqs, modSet);
  console.log(res);
  return;
};

// Odd test cases:
// ACC3706: 'one of' has a 'one of'
export const testPrereqTreeMods = async () => {
  const prereqTree = await fetchModulePrereqs("CS3263");
  const modSet = new Set<string>(["CS2030", "CS1232", "ST2334"]);
  const res = evaluatePrereqTreeMods(prereqTree.prereqs, modSet);
  console.log(res);
  return;
};

export const getNUSModsModulePage = (moduleCode: string): string =>
  "https://nusmods.com/modules/" + moduleCode;

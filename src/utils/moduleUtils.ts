import { moduleColor } from "../constants/moduleColor";
import { Requirement, Semester } from "../interfaces/planner";

export const addColorToModules = (moduleRequirements: Requirement[]) => {
  return moduleRequirements.map((requirement, idx) => ({
    ...requirement,
    modules: requirement.modules.map((mod) => ({
      ...mod,
      color: moduleColor[idx % moduleColor.length],
    })),
  }));
};

export const applyPrereqValidation = (semesters: Semester[]): Semester[] => {
  const takenModuleSet = new Set();

  for (let i = 0; i < semesters.length; i++) {
    for (let j = 0; j < semesters[i].modules.length; j++) {
      let module = semesters[i].modules[j];
      module.prereqsViolated = [];
      if (module.prereqs !== undefined) {
        for (let prereq of module.prereqs) {
          if (!takenModuleSet.has(prereq)) {
            module.prereqsViolated.push(prereq);
          }
        }
      }
      console.log(module);
      semesters[i].modules[j] = module;
    }
    for (let j = 0; j < semesters[i].modules.length; j++) {
      takenModuleSet.add(semesters[i].modules[j].code);
    }
  }

  return semesters;
};

export const getNUSModsModulePage = (moduleCode: string): string =>
  "https://nusmods.com/modules/" + moduleCode;

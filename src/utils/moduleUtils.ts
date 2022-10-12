import { moduleColor } from "../constants/moduleColor";
import { Requirement } from "../interfaces/planner";

export const addColorToModules = (moduleRequirements: Requirement[]) => {
  return moduleRequirements.map((requirement, idx) => ({
    ...requirement,
    modules: requirement.modules.map((mod) => ({
      ...mod,
      color: moduleColor[idx % moduleColor.length],
    })),
  }));
};

import { MainViewModel } from "../models";
import moduleList1920 from "../data/module_list/moduleList1920.json";
import moduleList2021 from "../data/module_list/moduleList2021.json";
import moduleList2122 from "../data/module_list/moduleList2122.json";
import moduleList2223 from "../data/module_list/moduleList2223.json";
import * as models from "../models";
import {
  PLANNER_SEMESTERS,
  PLANNER_YEARS,
  VIEWMODEL_STORAGE,
} from "../constants/planner";

export interface moduleListInterface {
  moduleCode: string;
  title: string;
  semesters: number[];
}

const moduleList = Array.prototype.concat(
  moduleList1920,
  moduleList2021,
  moduleList2122,
  moduleList2223,
) as moduleListInterface[];

export default moduleList;

export const labelModules = (moduleArr: models.Module[]) => {
  const moduleDataMap = new Map<string, string>();
  moduleList.forEach((x) => moduleDataMap.set(x.moduleCode, x.title));
  for (let mod of moduleArr) {
    if (mod !== undefined) {
      mod.name = moduleDataMap.get(mod.code) ?? "";
    }
  }
};

export const sortRequirementModules = (viewModel: MainViewModel): void => {
  const modReqMap = new Map();
  for (let requirement of viewModel.requirements) {
    for (let mod of requirement.modules) {
      modReqMap.set(mod.id, mod);
    }
  }

  const addedSet = new Set();
  for (let i = 0; i < viewModel.requirements.length; i++) {
    viewModel.requirements[i].modules = [];
    for (let mod of viewModel.requirements[i].allModules) {
      if (modReqMap.has(mod.id)) {
        viewModel.requirements[i].modules.push(modReqMap.get(mod.id));
        addedSet.add(mod.id);
      }
    }
  }

  const extraModules = [...modReqMap.keys()].filter((x) => !addedSet.has(x));
  extraModules.forEach((modCode) =>
    viewModel.requirements.at(-1)?.modules.push(modReqMap.get(modCode)),
  );

  for (let requirement of viewModel.requirements) {
    requirement.modules = [...new Set(requirement.modules)].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
  }

  storeViewModel(viewModel);
};

export const loadViewModel = (viewModel: MainViewModel): void => {
  const viewModelString = localStorage.getItem(VIEWMODEL_STORAGE);
  if (viewModelString === null) return;

  viewModel.hydrateWithStorageString(viewModelString);

  // TODO: Remove following 'fixes' maybe?
  labelModules(Array.from(viewModel.modulesMap.values()));
  const plannerModulesSet = new Set(
    viewModel.planner
      .map((x) => x.modules)
      .flat(1)
      .map((x) => x.id),
  );
  viewModel.requirements.map((x) =>
    x.filtered((mod) => !plannerModulesSet.has(mod.id)),
  );

  sortRequirementModules(viewModel);
  viewModel.validate();
};

export const storeViewModel = (viewModel: MainViewModel): void => {
  localStorage.setItem(VIEWMODEL_STORAGE, viewModel.toStorageString());
};

export const storePlannerYears = (plannerYears: number[]): void => {
  localStorage.setItem(PLANNER_YEARS, JSON.stringify(plannerYears));
};

export const loadPlannerYears = (): number[] => {
  return JSON.parse(localStorage.getItem(PLANNER_YEARS) ?? "[1, 2, 3, 4]");
};

export const storePlannerSemesters = (plannerSemesters: number[][]): void => {
  localStorage.setItem(PLANNER_SEMESTERS, JSON.stringify(plannerSemesters));
};

export const loadPlannerSemesters = (): number[][] => {
  return JSON.parse(
    localStorage.getItem(PLANNER_SEMESTERS) ?? "[[1, 2],[1, 2],[1, 2],[1, 2]]",
  );
};

export function convertYearAndSemToIndex(year: number, sem: number) {
  return 4 * (year - 1) + sem + 1;
}

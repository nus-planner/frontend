import { MainViewModel } from "../models";
import moduleList from "../../locals/data";
import * as models from "../models";
import { VIEWMODEL_STORAGE } from "../constants/planner";

export interface moduleListInterface {
  moduleCode: string;
  title: string;
  semesters: number[];
}

export const labelModules = (moduleArr: models.Module[]) => {
  const moduleDataMap = new Map<string, string>();
  moduleList.forEach((x) => moduleDataMap.set(x.moduleCode, x.title));
  for (let mod of moduleArr) {
    if (mod !== undefined) {
      mod.name = moduleDataMap.get(mod.code) ?? "";
    }
  }
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
      .map((x) => x.code),
  );
  viewModel.requirements.map((x) =>
    x.filtered((mod) => !plannerModulesSet.has(mod.code)),
  );
};

export const storeViewModel = (viewModel: MainViewModel): void => {
  localStorage.setItem(VIEWMODEL_STORAGE, viewModel.toStorageString());
};

export function convertYearAndSemToIndex(year: number, sem: number) {
  return 4 * (year - 1) + sem;
}

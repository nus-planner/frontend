import { MainViewModel } from "../models";
import moduleList from "../../locals/data";
import * as models from "../models";

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

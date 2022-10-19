import fs from "fs"; // This file is only meant to run locally
import yaml from "js-yaml";
import * as models from "../models";
import * as log from "../models/log";

const map = {
  1: 1,
  2: 2,
  ST1: 3,
  ST2: 4,
};

type JSONPlanSemester = {
  year: number;
  semester: 1 | 2 | "ST1" | "ST2";
  modules: Array<string>;
};

type JSONPlan = {
  starting_year: number;
  years: number;
  semesters: Array<JSONPlanSemester>;
};

function createAcademicPlan(
  jsonPlan: JSONPlan,
  validatorState: models.ValidatorState,
) {
  const acadPlan = new models.AcademicPlan(
    jsonPlan.starting_year,
    jsonPlan.years,
  );
  for (const jsonSemester of jsonPlan.semesters) {
    const semPlan = acadPlan.getSemPlan(
      jsonSemester.year,
      map[jsonSemester.semester],
    );
    for (const mod of jsonSemester.modules) {
      semPlan.modules.push(validatorState.getAndAddIfNotExists(mod, 4));
    }
  }
  return acadPlan;
}

export function verify(
  pathToRequirementsJSON: string,
  pathToAcademicPlanJSON: string,
) {
  const validatorState = new models.ValidatorState();
  validatorState.initializeFromString(
    fs.readFileSync(pathToRequirementsJSON, "utf8"),
  );
  const acadPlan = createAcademicPlan(
    yaml.load(fs.readFileSync(pathToAcademicPlanJSON, "utf8")) as JSONPlan,
    validatorState,
  );

  acadPlan.checkAgainstConfig(validatorState);
  log.log(validatorState.basket.getPrintableClone(5));
}

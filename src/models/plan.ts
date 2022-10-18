import * as input from "./input";
import { Basket } from "./basket";
import { Semester } from "../interfaces/planner";
export const moduleRegex =
  /(?<prefix>[A-Z]+)(?<codeNumber>\d)\d+(?<suffix>[A-Z]*)/;
export class ModuleState {
  matchedBaskets: Array<Basket> = [];
}
export class Module {
  state: ModuleState = new ModuleState();
  tags: Set<string> = new Set();
  prefix: string;
  suffix: string;
  code: string;
  level: number;
  name: string;
  credits: number;
  constructor(code: string, name: string, credits: number) {
    this.code = code;
    const match = moduleRegex.exec(code);
    if (match === null || match.groups === undefined) {
      throw new Error(`Invalid module code ${code}`);
    }
    this.level = Number.parseInt(match.groups["codeNumber"]);
    this.name = name;
    this.credits = credits;

    this.prefix = match.groups["prefix"] || "";
    this.suffix = match.groups["suffix"] || "";
  }

  resetState() {
    this.state = new ModuleState();
  }
}
export class AcademicPlan {
  startYear: number;
  plans: Array<SemPlan>;

  private modules: Array<Module> = [];
  private moduleCodeToModuleMap: Map<string, Module> = new Map();

  constructor(startYear: number, numYears: number = 4) {
    this.startYear = startYear;
    this.plans = new Array(numYears);
    for (let i = 0; i < numYears * 4; i++) {
      this.plans[i] = new SemPlan(Math.floor(i / 4) + 1, (i % 4) + 1, []);
    }
  }

  public get numYears(): number {
    return Math.floor(this.plans.length / 4);
  }

  public get numSemesters(): number {
    return this.plans.length;
  }

  preprocess() {
    this.modules = [];
    this.moduleCodeToModuleMap.clear();
    for (const plan of this.plans) {
      for (const mod of plan.modules) {
        this.modules.push(mod);
        this.moduleCodeToModuleMap.set(mod.code, mod);
      }
    }
  }

  getPlanView(): AcademicPlanView {
    this.preprocess();
    return new AcademicPlanView(this, this.modules);
  }

  getModules() {
    return this.modules;
  }

  resetState() {
    this.modules.forEach((module) => module.resetState());
  }

  checkAgainstConfig(config: input.ValidatorState) {
    for (const [k, v] of config.doubleCountedModules) {
      if (this.getPlanView().modules.find((m) => m.code === k) === undefined) {
        continue;
      }

      for (const basket of v) {
        basket.doubleCount();
      }
    }

    return this.checkAgainstBasket(config.basket);
  }

  checkAgainstBasket(basket: Basket): boolean {
    return basket.isFulfilledWithState(this.getPlanView()).isFulfilled;
  }
}

enum SemesterNumber {
  ONE = 0,
  TWO = 1,
  SPECIAL_TERM_ONE = 2,
  SPECIAL_TERM_TWO = 3,
}

export class SemPlan {
  year: number;
  semester: SemesterNumber;
  modules: Array<Module>;

  private moduleCodeToModuleMap: Map<string, Module> = new Map();

  constructor(year: number, semester: SemesterNumber, modules: Array<Module>) {
    this.year = year;
    this.semester = semester;
    this.modules = modules;
  }

  preprocess() {
    this.moduleCodeToModuleMap.clear();
    for (const mod of this.modules) {
      this.moduleCodeToModuleMap.set(mod.code, mod);
    }
  }
}
export class AcademicPlanView {
  private academicPlan: AcademicPlan;
  modules: Array<Module>;
  constructor(academicPlan: AcademicPlan, modules: Array<Module>) {
    this.academicPlan = academicPlan;
    this.modules = modules;
  }

  getModules() {
    return this.modules;
  }

  withModules(modules: Array<Module>): AcademicPlanView {
    return new AcademicPlanView(this.academicPlan, modules);
  }

  withModulesFilteredBy(filter: Filter): AcademicPlanView {
    return this.withModules(this.modules.filter(filter.getFilter()));
  }

  withOriginalPlan(): AcademicPlanView {
    return new AcademicPlanView(
      this.academicPlan,
      this.academicPlan.getModules(),
    );
  }
}

export abstract class Filter {
  abstract filter(module: Module): boolean;

  getFilter() {
    return this.filter.bind(this);
  }
}

class PropertyFilter<K extends keyof Module> extends Filter {
  propertyName: K;
  equals: Module[K];
  negate: boolean;
  constructor(propertyName: K, equals: Module[K], negate: boolean = false) {
    super();
    this.propertyName = propertyName;
    this.equals = equals;
    this.negate = negate;
  }

  filter(module: Module): boolean {
    return this.negate
      ? module[this.propertyName] != this.equals
      : module[this.propertyName] == this.equals;
  }
}

class PropertyArrayFilter<K extends keyof Module> extends Filter {
  propertyName: K;
  arr: Array<Module[K]>;

  constructor(propertyName: K, arr: Array<Module[K]>) {
    super();
    this.propertyName = propertyName;
    this.arr = arr;
  }

  filter(module: Module): boolean {
    return !!this.arr.find((x) => x === module[this.propertyName]);
  }
}

export class PropertySetFilter<K extends keyof Module> extends Filter {
  propertyName: K;
  set: Set<Module[K]>;

  constructor(propertyName: K, set: Set<Module[K]>) {
    super();
    this.propertyName = propertyName;
    this.set = set;
  }

  filter(module: Module): boolean {
    return !this.set.has(module[this.propertyName]);
  }
}

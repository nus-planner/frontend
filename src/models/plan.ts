import * as input from "./input";
import { convertYearAndSemToIndex } from "../utils/plannerUtils";
import { Basket } from "./basket";
import { Exclude, Type } from "class-transformer";
export const moduleRegex =
  /(?<prefix>[A-Z]+)(?<codeNumber>\d)\d+(?<suffix>[A-Z]*)/;

export class ModuleState {
  // The baskets that the module is matched to.
  // There can be more than one basket, for e.g. when double counting.
  matchedBaskets: Array<Basket> = [];
}
export class Module {
  // A placeholder object.
  static emptyModule: Module = new Module("EMPTY9999", "Empty", 0);

  // State used during the requirement verification algorithm.
  // The state is only meaningful after at least verifying once.
  @Exclude()
  state: ModuleState = new ModuleState();

  // Tags are labels that we associate with a module. Think of them as hashtags.
  @Exclude()
  tags: Set<string> = new Set();

  // E.g. The prefix of ABC1234XY is ABC.
  prefix: string;

  // E.g. The suffix of ABC1234XY is XY.
  suffix: string;

  // E.g. The code of ABC1234XY is ABC1234XY.
  code: string;

  // E.g. The level of ABC1234XY is 1. The level of ABC3234XY is 3.
  level: number;

  // The human readable name of a module.
  name: string;

  // Number of MCs.
  credits: number;
  constructor(code: string, name: string, credits: number) {
    if (code === undefined) {
      return;
    }
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
  // The matriculation year.
  startYear: number;

  // An array of plans.
  // plans[0] is for exemptions and plans[1] is for apcs.
  // plans[2] is Y1S1
  // plans[3] is Y1S2
  // plans[4] is Y1ST1
  // plans[5] is Y1ST2
  // plans[6] is Y2S1
  // and so on...
  @Type(() => SemPlan)
  plans: Array<SemPlan>;

  constructor(startYear: number, numYears: number = 4) {
    this.startYear = startYear;
    this.plans = new Array(numYears * 4);
    for (let i = 0; i < numYears * 4 + 2; i++) {
      this.plans[i] = new SemPlan(Math.floor(i / 4) + 1, (i % 4) + 1, []);
    }
  }

  public get numYears(): number {
    return Math.floor(this.plans.length / 4);
  }

  public get numSemesters(): number {
    return this.plans.length;
  }

  public set numSemesters(newValue: number) {
    this.plans.length = newValue;
  }

  @Exclude()
  get modules(): Array<Module> {
    const mods: Array<Module> = [];
    for (const plan of this.plans) {
      for (const mod of plan.modules) {
        mods.push(mod);
      }
    }
    return mods;
  }

  getSemPlan(year: number, semester: SemesterNumber) {
    return this.plans[convertYearAndSemToIndex(year, semester)];
  }

  preprocess() {}

  getPlanView(): AcademicPlanView {
    return new AcademicPlanView(this, this.modules);
  }

  resetState() {
    this.modules.forEach((module) => module.resetState());
  }

  checkAgainstConfig(config: input.ValidatorState) {
    this.resetState();
    config.basket.resetSubtreeState();
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

  private checkAgainstBasket(basket: Basket): boolean {
    return basket.isFulfilledWithState(this.getPlanView()).isFulfilled;
  }
}

enum SemesterNumber {
  EXEMPTION = 0,
  ONE = 1,
  TWO = 2,
  SPECIAL_TERM_ONE = 3,
  SPECIAL_TERM_TWO = 4,
}

export class SemPlan {
  year: number;
  semester: SemesterNumber;
  @Type(() => Module)
  modules: Array<Module>;

  constructor(year: number, semester: SemesterNumber, modules: Array<Module>) {
    this.year = year;
    this.semester = semester;
    this.modules = modules;
  }
}

@Exclude()
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
    return new AcademicPlanView(this.academicPlan, this.academicPlan.modules);
  }
}

@Exclude()
export abstract class Filter {
  abstract filter(module: Module): boolean;

  getFilter() {
    return this.filter.bind(this);
  }
}

@Exclude()
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

@Exclude()
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

@Exclude()
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

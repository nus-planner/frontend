import * as frontend from "../interfaces/planner";
import { insertAtIndex, removeAtIndex } from "../utils/dndUtils";
import { addColorToModules } from "../utils/moduleUtils";
import * as basket from "./basket";
import * as input from "./input";
import * as plan from "./plan";
export class ModuleViewModel implements frontend.Module {
  color?: string | undefined;
  editable?: boolean | undefined;
  prereqs?: frontend.PrereqTree | undefined;
  prereqsViolated?: string[][] | undefined;
  private module: plan.Module;

  public get code(): string {
    return this.module.code;
  }

  public get name(): string {
    return this.module.name;
  }

  public get credits(): number {
    return this.module.credits;
  }

  constructor(module: plan.Module) {
    this.module = module;
  }

  getUnderlyingModule(): plan.Module {
    return this.module;
  }
}

export class MultiModuleViewModel implements frontend.Module {
  color?: string | undefined;
  code: string;
  name: string;
  credits: number;
  editable?: boolean | undefined;
  prereqs?: frontend.PrereqTree | undefined;
  prereqsViolated?: string[][] | undefined;

  constructor(code: string, name: string, credits: number) {
    this.code = code;
    this.name = name;
    this.credits = credits;
  }
  preclusions?: string[];
  getUnderlyingModule() {
    return undefined;
  }
}

type ModuleSpecifier = basket.ModuleBasket | basket.MultiModuleBasket;
class BasketFlattener extends basket.BasketVisitor<Array<ModuleSpecifier>> {
  visitStatefulBasket(basket: basket.StatefulBasket): Array<ModuleSpecifier> {
    return this.visit(basket.basket);
  }
  visitArrayBasket(basket: basket.ArrayBasket): Array<ModuleSpecifier> {
    return basket.baskets.flatMap((basket) => this.visit(basket));
  }
  visitFulfillmentResultBasket(
    basket: basket.FulfillmentResultBasket
  ): Array<ModuleSpecifier> {
    return this.visit(basket.basket);
  }
  visitModuleBasket(basket: basket.ModuleBasket): Array<ModuleSpecifier> {
    return [basket];
  }
  visitMultiModuleBasket(
    basket: basket.MultiModuleBasket
  ): Array<ModuleSpecifier> {
    return [basket];
  }
}

export class RequirementViewModel implements frontend.Requirement {
  totalCredits: number;
  allModules: frontend.Module[];
  modules: frontend.Module[];
  private basket: basket.Basket;

  constructor(basket: basket.Basket) {
    this.basket = basket;
    this.totalCredits = -1; // I don't think this is possible?
    this.allModules = new BasketFlattener()
      .visit(basket)
      .map((basket): frontend.Module => {
        if ("module" in basket) {
          return new ModuleViewModel(basket.module);
        } else {
          return new MultiModuleViewModel(
            basket.getEffectivePattern(),
            "Select A Basket",
            -1
          );
        }
      });

    this.modules = this.allModules;
  }

  public get title(): string {
    return this.basket.title;
  }

  public get description(): string {
    return this.basket.description || "";
  }

  filtered(filter: (mod: frontend.Module) => boolean) {
    this.modules = this.modules.filter(filter);
  }
}

class SemesterViewModel implements frontend.Semester {
  private semPlan: plan.SemPlan;
  private _modules: frontend.Module[];
  constructor(semPlan: plan.SemPlan) {
    this.semPlan = semPlan;
    this._modules = [];
  }
  get year(): number {
    return this.semPlan.year;
  }
  get semester(): number {
    return this.semPlan.semester;
  }

  get modules(): frontend.Module[] {
    return this._modules;
  }

  addModule(module: frontend.Module) {
    this.semPlan.modules.push(module.getUnderlyingModule());
    this._modules.push(module);
  }

  addModuleAtIndex(module: frontend.Module, index: number) {
    insertAtIndex(this.semPlan.modules, index, module.getUnderlyingModule());
    insertAtIndex(this._modules, index, module);
  }

  removeAtIndex(index: number) {
    removeAtIndex(this.semPlan.modules, index);
    removeAtIndex(this._modules, index);
  }

  filtered(filter: (mod: frontend.Module) => boolean) {
    const left = this._modules
      .filter((mod) => !filter(mod))
      .map((mod) => mod.getUnderlyingModule());
    this.semPlan.modules = this.semPlan.modules.filter((mod) =>
      left.includes(mod)
    );
    this._modules = this._modules.filter(filter);
  }
}

class AcademicPlanViewModel {
  semesterViewModels: Array<SemesterViewModel>;
  private academicPlan: plan.AcademicPlan;
  constructor(academicPlan: plan.AcademicPlan) {
    this.academicPlan = academicPlan;
  }

  public get startYear(): string {
    return this.academicPlan.startYear.toString();
  }
}

export class MainViewModel implements frontend.ModulesState {
  private _requirements?: Array<RequirementViewModel>;
  academicPlanViewModel: AcademicPlanViewModel;
  moduleViewModelsMap: Map<string, frontend.Module>;
  private validatorState: input.ValidatorState;

  constructor(startYear: number, numYears = 4) {
    this.academicPlanViewModel = new AcademicPlanViewModel(
      new plan.AcademicPlan(startYear, numYears)
    );
    this.validatorState = new input.ValidatorState();
  }

  public get planner() {
    return this.academicPlanViewModel.semesterViewModels;
  }

  public get requirements(): Array<RequirementViewModel> {
    if (this.validatorState.isUninitialized()) {
      return [];
    }

    if (this._requirements === undefined) {
      this._requirements = this.validatorState.basket
        .childBaskets()
        .map((basket) => new RequirementViewModel(basket));
      addColorToModules(this._requirements);
    }

    return this._requirements;
  }

  get modulesMap(): Map<string, plan.Module> {
    return this.validatorState.allModules;
  }

  public get startYear(): string {
    return this.academicPlanViewModel.startYear;
  }

  initializeFromURL(url: string) {
    this.validatorState.initializeFromURL(url);
  }
}

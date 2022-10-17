import * as frontend from "../interfaces/planner";
import { filterInPlace, insertAtIndex, removeAtIndex } from "../utils/dndUtils";
import { addColorToModules, addColorToModulesv2 } from "../utils/moduleUtils";
import * as basket from "./basket";
import * as input from "./input";
import * as plan from "./plan";

interface GlobalModuleViewModelStateDelegate {
  addModuleViewModelToGlobalState: (
    moduleViewModel: frontend.Module,
    addIfExists?: boolean,
  ) => frontend.Module;
  removeModuleViewModelFromGlobalState: (code: string) => void;
}

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

  public get tags(): string[] {
    return Array.from(this.module.tags);
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

  public get tags(): string[] {
    return [];
  }

  preclusions?: string[];
  getUnderlyingModule() {
    return undefined;
  }
}

type ModuleSpecifier = basket.ModuleBasket | basket.MultiModuleBasket;

class TagGatherer extends basket.BasketVisitor<Set<string>> {
  visitStatefulBasket(basket: basket.StatefulBasket): Set<string> {
    return this.visit(basket.basket);
  }
  visitArrayBasket(basket: basket.ArrayBasket): Set<string> {
    const set = new Set<string>();
    for (const child of basket.childBaskets()) {
      const childSet = this.visit(child);
      for (const tag of childSet) {
        set.add(tag);
      }
    }
    return set;
  }
  visitFulfillmentResultBasket(
    basket: basket.FulfillmentResultBasket,
  ): Set<string> {
    return this.visit(basket.basket);
  }
  visitModuleBasket(basket: basket.ModuleBasket): Set<string> {
    return basket.module.tags;
  }
  visitMultiModuleBasket(basket: basket.MultiModuleBasket): Set<string> {
    return new Set();
  }
}

class BasketFlattener extends basket.BasketVisitor<Array<ModuleSpecifier>> {
  visitStatefulBasket(basket: basket.StatefulBasket): Array<ModuleSpecifier> {
    return this.visit(basket.basket);
  }
  visitArrayBasket(basket: basket.ArrayBasket): Array<ModuleSpecifier> {
    return basket.baskets.flatMap((basket) => this.visit(basket));
  }
  visitFulfillmentResultBasket(
    basket: basket.FulfillmentResultBasket,
  ): Array<ModuleSpecifier> {
    return this.visit(basket.basket);
  }
  visitModuleBasket(basket: basket.ModuleBasket): Array<ModuleSpecifier> {
    return [basket];
  }
  visitMultiModuleBasket(
    basket: basket.MultiModuleBasket,
  ): Array<ModuleSpecifier> {
    return [basket];
  }
}

export class RequirementViewModel implements frontend.Requirement {
  private moduleStateDelegate: GlobalModuleViewModelStateDelegate;
  totalCredits: number;
  allTags: string[];
  allModules: frontend.Module[];
  modules: frontend.Module[];
  private basket: basket.Basket;

  constructor(
    moduleStateDelegate: GlobalModuleViewModelStateDelegate,
    basket: basket.Basket,
  ) {
    this.moduleStateDelegate = moduleStateDelegate;
    this.basket = basket;
    this.totalCredits = -1; // I don't think this is possible?

    const tagSet = new TagGatherer().visit(basket);
    this.allTags = Array.from(tagSet);

    this.allModules = new BasketFlattener()
      .visit(basket)
      .map((basket): frontend.Module => {
        if ("module" in basket) {
          return moduleStateDelegate.addModuleViewModelToGlobalState(
            new ModuleViewModel(basket.module),
          );
        } else {
          return moduleStateDelegate.addModuleViewModelToGlobalState(
            new MultiModuleViewModel(
              basket.getEffectivePattern(),
              "Select A Basket",
              -1,
            ),
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
  private moduleStateDelegate: GlobalModuleViewModelStateDelegate;
  private _trickle: TrickleDownArray<frontend.Module, plan.Module>;
  private semPlan: plan.SemPlan;
  private _modules: frontend.Module[];
  constructor(
    moduleStateDelegate: GlobalModuleViewModelStateDelegate,
    semPlan: plan.SemPlan,
  ) {
    this.moduleStateDelegate = moduleStateDelegate;
    this.semPlan = semPlan;
    this._modules = [];
    this._trickle = new TrickleDownArray(
      this._modules,
      semPlan.modules,
      (modViewModel) => modViewModel.getUnderlyingModule!()!, // TODO: Deal with !
      (mod) => new ModuleViewModel(mod),
    );
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

  getUnderlyingSemPlan() {
    return this.semPlan;
  }

  addModule(module: frontend.Module) {
    this._trickle.push(module);
  }

  addModuleAtIndex(module: frontend.Module, index: number) {
    this._trickle.insertAtIndex(module, index);
  }

  removeAtIndex(index: number) {
    this._trickle.removeAtIndex(index);
  }

  filtered(filter: (mod: frontend.Module) => boolean) {
    this._trickle.filtered(filter);
  }
}

class TrickleDownMap<K, V1, V2> {
  map1: Map<K, V1>;
  map2: Map<K, V2>;
  convertDown: (v1: V1) => V2;
  convertUp?: (t2: V2) => V1;
  constructor(
    map1: Map<K, V1>,
    map2: Map<K, V2>,
    convertDown: (v1: V1) => V2,
    convertUp?: (t2: V2) => V1,
  ) {
    this.map1 = map1;
    this.map2 = map2;
    this.convertDown = convertDown;
    if (convertUp) {
      for (const [k, v] of map2.entries()) {
        map1.set(k, convertUp(v));
      }
      this.convertUp = convertUp;
    }
  }

  containsKey(key: K) {
    return this.map1.has(key);
  }

  getByKey(key: K) {
    return this.map1.get(key);
  }

  setKeyValue(key: K, value: V1) {
    this.map1.set(key, value);
    this.map2.set(key, this.convertDown(value));
  }

  deleteByKey(key: K) {
    this.map1.delete(key);
    this.map2.delete(key);
  }
}

class TrickleDownArray<T1, T2> {
  arr1: Array<T1>;
  arr2: Array<T2>;
  convertDown: (t1: T1) => T2;
  convertUp?: (t2: T2) => T1;
  constructor(
    arr1: Array<T1>,
    arr2: Array<T2>,
    convertDown: (t1: T1) => T2,
    convertUp?: (t2: T2) => T1,
  ) {
    this.arr1 = arr1;
    this.arr2 = arr2;
    this.convertDown = convertDown;
    if (convertUp) {
      for (const ele of arr2) {
        arr1.push(convertUp(ele));
      }
      this.convertUp = convertUp;
    }
  }

  push(t1: T1) {
    this.arr1.push(t1);
    this.arr2.push(this.convertDown(t1));
  }

  insertAtIndex(t1: T1, index: number) {
    this.arr1.splice(index, 0, t1);
    this.arr2.splice(index, 0, this.convertDown(t1));
  }

  removeAtIndex(index: number) {
    this.arr1.splice(index, 1);
    this.arr2.splice(index, 1);
  }

  filtered(filter: (t1: T1) => boolean) {
    let i = 0,
      j = 0;

    while (i < this.arr1.length) {
      if (filter(this.arr1[i])) {
        this.arr1[j] = this.arr1[i];
        this.arr2[j] = this.arr2[i];
        j++;
      }
      i++;
    }

    this.arr1.length = j;
    this.arr2.length = j;
  }
}

class AcademicPlanViewModel {
  private moduleStateDelegate: GlobalModuleViewModelStateDelegate;
  private _trickle: TrickleDownArray<SemesterViewModel, plan.SemPlan>;
  readonly semesterViewModels: Array<SemesterViewModel>;
  private academicPlan: plan.AcademicPlan;
  constructor(
    moduleStateDelegate: GlobalModuleViewModelStateDelegate,
    academicPlan: plan.AcademicPlan,
  ) {
    this.moduleStateDelegate = moduleStateDelegate;
    this.academicPlan = academicPlan;
    this.semesterViewModels = [];
    this._trickle = new TrickleDownArray(
      this.semesterViewModels,
      this.academicPlan.plans,
      (model) => model.getUnderlyingSemPlan(),
      (semPlan) => new SemesterViewModel(moduleStateDelegate, semPlan),
    );
  }

  public get startYear(): string {
    return this.academicPlan.startYear.toString();
  }

  addSemester(semester: SemesterViewModel) {
    this._trickle.push(semester);
  }

  addSemesterAtIndex(semester: SemesterViewModel, index: number) {
    this._trickle.insertAtIndex(semester, index);
  }

  removeAtIndex(index: number) {
    this._trickle.removeAtIndex(index);
  }
}

export class MainViewModel
  implements frontend.ModulesState, GlobalModuleViewModelStateDelegate
{
  private _trickle: TrickleDownMap<string, frontend.Module, plan.Module>;
  private _requirements?: Array<RequirementViewModel>;
  readonly academicPlanViewModel: AcademicPlanViewModel;
  readonly moduleViewModelsMap: Map<string, frontend.Module>;
  private validatorState: input.ValidatorState;

  constructor(startYear: number, numYears = 4) {
    this.academicPlanViewModel = new AcademicPlanViewModel(
      this,
      new plan.AcademicPlan(startYear, numYears),
    );
    this.moduleViewModelsMap = new Map();
    this.validatorState = new input.ValidatorState();
    this._trickle = new TrickleDownMap(
      this.moduleViewModelsMap,
      this.validatorState.allModules,
      (moduleViewModel) => moduleViewModel.getUnderlyingModule!()!, // TODO: Resolve the !
      (mod) => new ModuleViewModel(mod),
    );
  }

  addModuleViewModelToGlobalState(
    moduleViewModel: frontend.Module,
    addIfExists: boolean = false,
  ): frontend.Module {
    if (!addIfExists && this._trickle.containsKey(moduleViewModel.code)) {
      return this._trickle.getByKey(moduleViewModel.code)!;
    }

    this._trickle.setKeyValue(moduleViewModel.code, moduleViewModel);
    return moduleViewModel;
  }
  removeModuleViewModelFromGlobalState(code: string): void {
    this._trickle.deleteByKey(code);
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
        .map((basket) => new RequirementViewModel(this, basket));
      addColorToModulesv2(this._requirements);
    }

    return this._requirements;
  }

  get modulesMap(): Map<string, plan.Module> {
    return this.validatorState.allModules;
  }

  public get startYear(): string {
    return this.academicPlanViewModel.startYear;
  }

  async initializeFromURL(url: string) {
    return this.validatorState.initializeFromURL(url);
  }
}

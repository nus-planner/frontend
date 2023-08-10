import 'reflect-metadata'; // needed for class-transformer https://github.com/typestack/class-transformer/issues/178
import {
  classToPlain,
  Exclude,
  Expose,
  instanceToPlain,
  plainToClass,
  plainToInstance,
  Type,
} from "class-transformer";
import yaml from "js-yaml";
import * as frontend from "../interfaces/planner";
import { addColorToModulesv2 } from "../utils/moduleUtils";
import { convertYearAndSemToIndex } from "../utils/plannerUtils";
import * as basket from "./basket";
import * as input from "./input";
import * as plan from "./plan";

type ModuleOptions = { name: string } | { code: string };
interface AcademicPlanDelegate {
  moduleExists(moduleCode: string): boolean;
  moduleViewModelExists(options: ModuleOptions): boolean;
  getModule(options: ModuleOptions): frontend.Module | undefined;
}
interface RequirementDelegate {
  getRequirement(forBasket: basket.Basket): RequirementViewModel | undefined;
}

interface GlobalModuleViewModelStateDelegate {
  getModuleAndViewModel(
    id: string,
  ): [plan.Module | undefined, frontend.Module | undefined];
  addModuleAndViewModelToGlobalState(
    ...x: ConstructorParameters<typeof plan.Module>
  ): [plan.Module, frontend.Module];
  addModuleViewModelToGlobalState(
    moduleViewModel: frontend.Module,
    addIfExists?: boolean,
  ): frontend.Module;
  addModuleToGlobalState(
    module: plan.Module,
    addIfExists?: boolean,
  ): plan.Module;
  removeModuleViewModelFromGlobalState(code: string): void;
}

export class ModuleViewModel implements frontend.Module {
  type = "module";
  requirementDelegate: RequirementDelegate;
  color?: string[];
  editable?: boolean;
  prereqs?: frontend.PrereqTree;
  prereqsViolated?: frontend.PrereqTree[];
  semester?: SemesterViewModel;

  public get id(): string {
    return this.code;
  }

  public get respawnable(): boolean {
    return false;
  }

  @Expose()
  @Type(() => plan.Module)
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

  public get matchedBaskets(): basket.Basket[] {
    return this.module.state.matchedBaskets;
  }

  constructor(requirementDelegate: RequirementDelegate, module: plan.Module) {
    this.requirementDelegate = requirementDelegate;
    this.module = module;
  }
  preclusions?: string[] | null | undefined;
  public get isMultiModule(): boolean {
    return false;
  }

  selectModule(module: plan.Module): void {
    throw new Error("Method not implemented.");
  }

  getUnderlyingModule(): plan.Module {
    return this.module;
  }

  getMatchedRequirements(): RequirementViewModel[] {
    const matches: RequirementViewModel[] = [];
    for (const matchedBasket of this.matchedBaskets) {
      const requirement =
        this.requirementDelegate.getRequirement(matchedBasket);
      if (requirement !== undefined) {
        matches.push(requirement);
      }
    }

    return matches;
  }

  hydrate(stored: this): void {
    this.color = stored.color;
    this.editable = stored.editable;
    this.prereqs = stored.prereqs;
    this.prereqsViolated = stored.prereqsViolated;
  }
}

export class MultiModuleViewModel implements frontend.Module {
  static count: number = 0;
  id: string;
  type = "multi-module";
  color?: string[];
  @Expose()
  code: string;
  name: string;
  credits: number;
  editable?: boolean;
  prereqs?: frontend.PrereqTree;
  prereqsViolated?: frontend.PrereqTree[];
  semester?: SemesterViewModel;
  @Expose()
  @Type(() => plan.Module)
  selectedModule?: plan.Module;
  respawnable: boolean = false;
  public get isMultiModule(): boolean {
    return true;
  }
  constructor(code: string, name: string, credits: number) {
    this.id = (MultiModuleViewModel.count++).toString();
    if (code === undefined) {
      return;
    }
    this.code = code;
    this.name = name;
    this.credits = credits;
  }

  public get tags(): string[] {
    return [];
  }

  preclusions?: string[];
  getUnderlyingModule() {
    return this.selectedModule;
  }

  selectModule(module: plan.Module): void {
    this.selectedModule = module;
    this.semester?.updateModule(this);
  }

  hydrate(storedMod: MultiModuleViewModel) {
    this.color = storedMod.color;
    this.editable = storedMod.editable;
    this.prereqs = storedMod.prereqs;
    this.prereqsViolated = storedMod.prereqsViolated;
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

class ModuleGatherer extends basket.BasketVisitor<Array<ModuleSpecifier>> {
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

class BasketGatherer extends basket.BasketVisitor<Array<basket.Basket>> {
  visitStatefulBasket(basket: basket.StatefulBasket): basket.Basket[] {
    const result = this.visit(basket.basket);
    result.push(basket);
    return result;
  }
  visitArrayBasket(basket: basket.ArrayBasket): basket.Basket[] {
    const result = [];
    for (const b of basket.baskets) {
      result.push(...this.visit(b));
    }
    result.push(basket);
    return result;
  }
  visitFulfillmentResultBasket(
    basket: basket.FulfillmentResultBasket,
  ): basket.Basket[] {
    const result = this.visit(basket.basket);
    result.push(basket);
    return result;
  }
  visitModuleBasket(basket: basket.ModuleBasket): basket.Basket[] {
    return [basket];
  }
  visitMultiModuleBasket(basket: basket.MultiModuleBasket): basket.Basket[] {
    return [basket];
  }
}

@Exclude()
export class RequirementViewModel implements frontend.Requirement {
  private moduleStateDelegate: GlobalModuleViewModelStateDelegate;
  private requirementDelegate: RequirementDelegate;
  private academicPlanDelegate: AcademicPlanDelegate;
  allTags: string[];
  allModules: frontend.Module[];
  modules: frontend.Module[];
  private basket: basket.Basket;

  constructor(
    moduleStateDelegate: GlobalModuleViewModelStateDelegate,
    requirementDelegate: RequirementDelegate,
    academicPlanDelegate: AcademicPlanDelegate,
    basket: basket.Basket,
  ) {
    this.moduleStateDelegate = moduleStateDelegate;
    this.requirementDelegate = requirementDelegate;
    this.academicPlanDelegate = academicPlanDelegate;
    this.basket = basket;

    const tagSet = new TagGatherer().visit(basket);
    this.allTags = Array.from(tagSet);

    this.allModules = new ModuleGatherer()
      .visit(basket)
      .unique()
      .flatMap((moduleSpecifier) => {
        if ("module" in moduleSpecifier) {
          if (academicPlanDelegate.moduleExists(moduleSpecifier.module.code)) {
            return (
              academicPlanDelegate.getModule({
                code: moduleSpecifier.module.code,
              }) || []
            );
          }
          return moduleStateDelegate.addModuleViewModelToGlobalState(
            new ModuleViewModel(requirementDelegate, moduleSpecifier.module),
          );
        } else {
          if (
            academicPlanDelegate.moduleViewModelExists({
              name: moduleSpecifier.title,
            })
          ) {
            return (
              academicPlanDelegate.getModule({
                name: moduleSpecifier.title,
              }) || []
            );
          }

          const model = new MultiModuleViewModel(
            moduleSpecifier.getEffectivePattern(),
            moduleSpecifier.title,
            -1,
          );
          model.respawnable = moduleSpecifier.respawnable;
          return moduleStateDelegate.addModuleViewModelToGlobalState(model);
        }
      });

    this.modules = this.allModules;
  }

  hydrate(): void {
    this.allModules = new ModuleGatherer()
      .visit(this.basket)
      .unique()
      .flatMap((moduleSpecifier) => {
        if ("module" in moduleSpecifier) {
          if (
            this.academicPlanDelegate.moduleExists(moduleSpecifier.module.code)
          ) {
            return (
              this.academicPlanDelegate.getModule({
                code: moduleSpecifier.module.code,
              }) || []
            );
          }
          return this.moduleStateDelegate.addModuleViewModelToGlobalState(
            new ModuleViewModel(
              this.requirementDelegate,
              moduleSpecifier.module,
            ),
          );
        } else {
          if (
            this.academicPlanDelegate.moduleViewModelExists({
              name: moduleSpecifier.title,
            })
          ) {
            const mod = this.academicPlanDelegate.getModule({
              name: moduleSpecifier.title,
            });
            if (mod) {
              mod.respawnable = moduleSpecifier.respawnable;
            }
            return mod || [];
          }

          const model = new MultiModuleViewModel(
            moduleSpecifier.getEffectivePattern(),
            moduleSpecifier.title,
            -1,
          );
          model.respawnable = moduleSpecifier.respawnable;
          return this.moduleStateDelegate.addModuleViewModelToGlobalState(
            model,
          );
        }
      });
    this.modules = this.allModules.filter(
      (mod) =>
        !this.academicPlanDelegate.moduleViewModelExists(
          mod instanceof ModuleViewModel
            ? {
                code: mod.code,
              }
            : { name: mod.name },
        ),
    );
  }

  public get title(): string {
    return this.basket.title;
  }

  public get description(): string {
    return this.basket.description || "";
  }

  public get allBaskets(): basket.Basket[] {
    return new BasketGatherer().visit(this.basket);
  }

  public get respawnables(): frontend.Module[] {
    return this.allModules.filter(
      (mod) => mod.isMultiModule && mod.respawnable,
    );
  }

  public get isFulfilled(): boolean {
    return this.basket.criterionState.isFulfilled;
  }

  public get matchedMCs(): number {
    return this.basket.criterionState.matchedMCs;
  }

  public get expectedMcs(): number | undefined {
    return this.basket.expectedMcs;
  }

  filtered(filter: (mod: frontend.Module) => boolean) {
    this.modules = this.modules.filter(filter);
  }
}

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
  years: number;
  exemptions: Array<string>;
  apcs: Array<string>;
  semesters: Array<JSONPlanSemester>;
};

@Exclude()
export class SemesterViewModel
  implements frontend.Semester, frontend.Hydratable
{
  private academicPlanDelegate: AcademicPlanDelegate;
  private moduleStateDelegate: GlobalModuleViewModelStateDelegate;
  private requirementDelegate: RequirementDelegate;
  private _trickle: TrickleDownArray<frontend.Module, plan.Module>;
  @Expose()
  private semPlan: plan.SemPlan;
  @Expose()
  @Type(() => Object, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: "type",
      subTypes: [
        { value: ModuleViewModel, name: "module" },
        { value: MultiModuleViewModel, name: "multi-module" },
      ],
    },
  })
  private _modules: frontend.Module[];
  constructor(
    academicPlanDelegate: AcademicPlanDelegate,
    moduleStateDelegate: GlobalModuleViewModelStateDelegate,
    requirementDelegate: RequirementDelegate,
    semPlan: plan.SemPlan,
  ) {
    if (academicPlanDelegate === undefined) {
      return;
    }
    this.academicPlanDelegate = academicPlanDelegate;
    this.moduleStateDelegate = moduleStateDelegate;
    this.requirementDelegate = requirementDelegate;
    this.semPlan = semPlan;
    this._modules = [];
    this._trickle = new TrickleDownArray(
      this._modules,
      semPlan.modules,
      (modViewModel) =>
        modViewModel.getUnderlyingModule!() || plan.Module.emptyModule,
      (mod) => new ModuleViewModel(this.requirementDelegate, mod),
    );
  }

  hydrate(stored: this): void {
    this.semPlan.year = stored.year;
    this.semPlan.semester = stored.semester;

    for (const storedMod of stored.modules) {
      if (!storedMod.getUnderlyingModule) {
        continue;
      }
      let mod = storedMod.getUnderlyingModule();
      if (mod === undefined) {
        continue;
      }
      mod = this.moduleStateDelegate.addModuleToGlobalState(mod);
      let moduleViewModel: frontend.Module;
      if (storedMod instanceof ModuleViewModel) {
        const vm = new ModuleViewModel(this.requirementDelegate, mod);
        vm.hydrate(storedMod);
        moduleViewModel = vm;
      } else if (storedMod instanceof MultiModuleViewModel) {
        const vm = new MultiModuleViewModel(
          storedMod.code,
          storedMod.name,
          storedMod.credits,
        );
        vm.hydrate(storedMod);
        vm.selectModule(mod);
        moduleViewModel = vm;
      } else {
        throw "Unexpected type";
      }
      moduleViewModel.semester = this;
      this.addModule(
        this.moduleStateDelegate.addModuleViewModelToGlobalState(
          moduleViewModel,
          false,
        ),
      );
    }
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
    if (this.academicPlanDelegate.moduleExists(module.code)) {
      return;
    }
    module.semester = this;
    this._trickle.push(module);
  }

  addModuleAtIndex(module: frontend.Module, index: number) {
    module.semester = this;
    this._trickle.insertAtIndex(module, index);
  }

  updateModule(module: frontend.Module) {
    this._trickle.update(module);
  }

  removeAtIndex(index: number) {
    this._trickle.removeAtIndex(index);
  }

  clearModules() {
    this._trickle.clear();
  }

  filtered(filter: (mod: frontend.Module) => boolean) {
    this._trickle.filtered(filter);
  }
}

@Exclude()
class TrickleDownMap<K, V1, V2> {
  readonly map1: Map<K, V1>;
  readonly map2: Map<K, V2>;
  readonly convertDown: (v1: V1) => V2;
  readonly convertUp?: (t2: V2) => V1;
  constructor(
    map1: Map<K, V1>,
    map2: Map<K, V2>,
    convertDown: (v1: V1) => V2,
    convertUp?: (t2: V2) => V1,
  ) {
    this.map1 = map1;
    this.map2 = map2;
    this.convertDown = convertDown;
    this.convertUp = convertUp;
    this.hydrate();
  }

  hydrate() {
    if (this.convertUp) {
      for (const [k, v] of this.map2.entries()) {
        this.map1.set(k, this.convertUp(v));
      }
    }
  }

  clear() {
    this.map1.clear();
    this.map2.clear();
  }

  containsKey(key: K) {
    return this.map1.has(key);
  }

  getByKey(key: K): [V1 | undefined, V2 | undefined] {
    return [this.map1.get(key), this.map2.get(key)];
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

@Exclude()
class TrickleDownArray<T1, T2> {
  readonly arr1: Array<T1>;
  readonly arr2: Array<T2>;
  readonly convertDown: (t1: T1) => T2;
  readonly convertUp?: (t2: T2) => T1;
  constructor(
    arr1: Array<T1>,
    arr2: Array<T2>,
    convertDown: (t1: T1) => T2,
    convertUp?: (t2: T2) => T1,
  ) {
    this.arr1 = arr1;
    this.arr2 = arr2;
    this.convertDown = convertDown;
    this.convertUp = convertUp;
    this.hydrate();
  }

  hydrate() {
    if (this.convertUp) {
      for (const ele of this.arr2) {
        this.arr1.push(this.convertUp(ele));
      }
    }
  }

  clear() {
    this.arr1.length = 0;
    this.arr2.length = 0;
  }

  push(t1: T1) {
    this.arr1.push(t1);
    this.arr2.push(this.convertDown(t1));
  }

  insertAtIndex(t1: T1, index: number) {
    this.arr1.splice(index, 0, t1);
    this.arr2.splice(index, 0, this.convertDown(t1));
  }

  update(t1: T1) {
    let index: number;
    if ((index = this.arr1.findIndex((ele) => ele === t1)) !== -1) {
      this.arr2[index] = this.convertDown(t1);
    }
  }

  updateAtIndex(t1: T1, index: number) {
    this.arr1[index] = t1;
    this.arr2[index] = this.convertDown(t1);
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

@Exclude()
class AcademicPlanViewModel
  implements frontend.Hydratable, AcademicPlanDelegate
{
  private moduleStateDelegate: GlobalModuleViewModelStateDelegate;
  private requirementDelegate: RequirementDelegate;

  private readonly _trickle: TrickleDownArray<SemesterViewModel, plan.SemPlan>;

  @Expose()
  @Type(() => SemesterViewModel)
  readonly semesterViewModels: Array<SemesterViewModel>;

  @Expose()
  @Type(() => plan.AcademicPlan)
  academicPlan: plan.AcademicPlan;

  constructor(
    moduleStateDelegate: GlobalModuleViewModelStateDelegate,
    requirementDelegate: RequirementDelegate,
    academicPlan: plan.AcademicPlan,
  ) {
    // should not have used class-transformer :(
    if (moduleStateDelegate === undefined) {
      return;
    }
    this.moduleStateDelegate = moduleStateDelegate;
    this.requirementDelegate = requirementDelegate;
    this.academicPlan = academicPlan;
    this.semesterViewModels = [];
    this._trickle = new TrickleDownArray(
      this.semesterViewModels,
      this.academicPlan.plans,
      (model) => model.getUnderlyingSemPlan(),
      (semPlan) =>
        new SemesterViewModel(
          this,
          moduleStateDelegate,
          requirementDelegate,
          semPlan,
        ),
    );
  }

  moduleExists(moduleCode: string): boolean {
    return this.academicPlan.modules.some((mod) => mod.code === moduleCode);
  }

  moduleViewModelExists(options: { name: string } | { code: string }): boolean {
    if ("name" in options) {
      return this.moduleViewModels.some((mod) => mod.name === options.name);
    } else if ("code" in options) {
      return this.moduleExists(options.code);
    }

    return false;
  }

  getModule(options: ModuleOptions): frontend.Module | undefined {
    if ("name" in options) {
      return this.moduleViewModels.find((mod) => mod.name === options.name);
    } else if ("code" in options) {
      return this.moduleViewModels.find((mod) => mod.code === options.code);
    }
  }

  hydrate(stored: this): void {
    this.clearSemesters();
    for (const semesterViewModel of stored.semesterViewModels) {
      const newSemesterViewModel = new SemesterViewModel(
        this,
        this.moduleStateDelegate,
        this.requirementDelegate,
        new plan.SemPlan(0, 0, []),
      );
      newSemesterViewModel.hydrate(semesterViewModel);
      this.addSemester(newSemesterViewModel);
    }
  }

  loadAcademicPlan(text: string): string[] {
    const jsonPlan = yaml.load(text) as JSONPlan;
    const mods = [];
    const exemptionsViewModel = this.exemptions;
    const apcsViewModel = this.apcs;

    for (const mod of jsonPlan.exemptions) {
      mods.push(mod);
      const newMod = this.moduleStateDelegate.addModuleToGlobalState(
        new plan.Module(mod, "", 4),
      );
      exemptionsViewModel.addModule(
        this.moduleStateDelegate.addModuleViewModelToGlobalState(
          new ModuleViewModel(this.requirementDelegate, newMod),
        ),
      );
    }

    for (const mod of jsonPlan.apcs) {
      mods.push(mod);
      const newMod = this.moduleStateDelegate.addModuleToGlobalState(
        new plan.Module(mod, "", 4),
      );
      apcsViewModel.addModule(
        this.moduleStateDelegate.addModuleViewModelToGlobalState(
          new ModuleViewModel(this.requirementDelegate, newMod),
        ),
      );
    }

    for (const jsonSemester of jsonPlan.semesters) {
      const semesterViewModel =
        this.semesterViewModels[
          convertYearAndSemToIndex(
            jsonSemester.year,
            map[jsonSemester.semester],
          )
        ];

      for (const mod of jsonSemester.modules) {
        mods.push(mod);
        const newMod = this.moduleStateDelegate.addModuleToGlobalState(
          new plan.Module(mod, "", 4),
        );
        semesterViewModel.addModule(
          this.moduleStateDelegate.addModuleViewModelToGlobalState(
            new ModuleViewModel(this.requirementDelegate, newMod),
          ),
        );
      }
    }

    return mods;
  }

  public get startYear(): string {
    return `${this.academicPlan.startYear}-${this.academicPlan.startYear + 1}`;
  }

  public get moduleYears(): string[] {
    const strings = [];
    for (let i = 0, y = this.academicPlan.startYear; i < 5; i++, y++) {
      strings.push(`${y}-${y + 1}`);
    }
    return strings;
  }

  // MCs are not counted, but modules are
  public get exemptions() {
    return this.semesterViewModels[0];
  }

  public get apcs() {
    return this.semesterViewModels[1];
  }

  get moduleViewModels(): frontend.Module[] {
    return this.semesterViewModels.flatMap(
      (semesterViewModel) => semesterViewModel.modules,
    );
  }

  clearSemesters() {
    this._trickle.clear();
  }

  clearModules() {
    for (const semesterViewModel of this.semesterViewModels) {
      semesterViewModel.clearModules();
    }
  }

  addSemester(semester: SemesterViewModel) {
    this._trickle.push(semester);
  }

  addSemesters(semesters: SemesterViewModel[]) {
    semesters.forEach((semester) => this._trickle.push(semester));
  }

  addSemesterAtIndex(semester: SemesterViewModel, index: number) {
    this._trickle.insertAtIndex(semester, index);
  }

  removeAtIndex(index: number) {
    this._trickle.removeAtIndex(index);
  }

  validate(config: input.ValidatorState) {
    const exemptionMods = this.exemptions.modules
      .map((mod) => mod.getUnderlyingModule?.())
      .filter((mod) => mod !== undefined) as plan.Module[];
    const storeMCs = new Map<plan.Module, number>();
    for (const exemptionMod of exemptionMods) {
      storeMCs.set(exemptionMod, exemptionMod.credits);
      exemptionMod.credits = 0;
    }

    const result = this.academicPlan.checkAgainstConfig(config);

    for (const [exemptionMod, mcs] of storeMCs.entries()) {
      exemptionMod.credits = mcs;
    }

    return result;
  }
}

@Exclude()
export class MainViewModel
  implements
    frontend.ModulesState,
    GlobalModuleViewModelStateDelegate,
    RequirementDelegate,
    frontend.Hydratable
{
  private _trickle: TrickleDownMap<string, frontend.Module, plan.Module>;

  private _requirements?: Array<RequirementViewModel>;

  @Expose()
  @Type(() => AcademicPlanViewModel)
  readonly academicPlanViewModel: AcademicPlanViewModel;

  @Expose()
  sampleStudyPlanUrl?: string;

  readonly moduleViewModelsMap: Map<string, frontend.Module>;

  private basketToRequirementViewModelMap: Map<
    basket.Basket,
    RequirementViewModel
  >;

  @Expose()
  @Type(() => input.ValidatorState)
  private validatorState: input.ValidatorState;

  get allModulesInTheWorld(): Array<plan.Module> {
    const selectedModules = (
      Array.from(this.moduleViewModelsMap.values())
        .map((mod) => mod.getUnderlyingModule?.())
        .filter((mod) => mod !== undefined) as Array<plan.Module>
    ).unique();
    return selectedModules;
  }

  constructor(startYear: number, numYears = 4, sampleStudyPlanUrl?: string) {
    this.academicPlanViewModel = new AcademicPlanViewModel(
      this,
      this,
      new plan.AcademicPlan(startYear, numYears),
    );
    this.sampleStudyPlanUrl = sampleStudyPlanUrl;
    this.moduleViewModelsMap = new Map();
    this.validatorState = new input.ValidatorState();
    this._trickle = new TrickleDownMap(
      this.moduleViewModelsMap,
      this.validatorState.allModules,
      (moduleViewModel) => moduleViewModel.getUnderlyingModule!()!, // TODO: Resolve the !
      (mod) => new ModuleViewModel(this, mod),
    );
    this.basketToRequirementViewModelMap = new Map();
  }

  getModuleAndViewModel(
    id: string,
  ): [plan.Module | undefined, frontend.Module | undefined] {
    const result = this._trickle.getByKey(id);
    return [result[1], result[0]];
  }

  addModuleAndViewModelToGlobalState(
    code: string,
    name: string,
    credits: number,
  ): [plan.Module, frontend.Module] {
    let mod = new plan.Module(code, name, credits);
    mod = this.addModuleToGlobalState(mod);
    let modViewModel: frontend.Module = new ModuleViewModel(this, mod);
    modViewModel = this.addModuleViewModelToGlobalState(modViewModel);
    return [mod, modViewModel];
  }

  addModuleViewModelToGlobalState(
    moduleViewModel: frontend.Module,
    addIfExists: boolean = false,
  ): frontend.Module {
    if (!addIfExists && this._trickle.containsKey(moduleViewModel.id)) {
      return this._trickle.getByKey(moduleViewModel.id)[0]!;
    }

    this._trickle.setKeyValue(moduleViewModel.id, moduleViewModel);
    return moduleViewModel;
  }

  addModuleToGlobalState(
    module: plan.Module,
    addIfExists: boolean = false,
  ): plan.Module {
    if (!addIfExists && this.validatorState.allModules.has(module.code)) {
      return this.validatorState.allModules.get(module.code)!;
    }

    this.validatorState.allModules.set(module.code, module);

    return module;
  }

  removeModuleViewModelFromGlobalState(code: string): void {
    this._trickle.deleteByKey(code);
  }

  getRequirement(forBasket: basket.Basket): RequirementViewModel | undefined {
    return this.basketToRequirementViewModelMap.get(forBasket);
  }

  public get planner() {
    return this.academicPlanViewModel.semesterViewModels;
  }

  public get exemptions() {
    return this.academicPlanViewModel.exemptions;
  }

  public get apcs() {
    return this.academicPlanViewModel.apcs;
  }

  public get requirements(): Array<RequirementViewModel> {
    if (this.validatorState.isUninitialized()) {
      return [];
    }

    if (this._requirements === undefined) {
      this._requirements = this.validatorState.basket
        .childBaskets()
        .map(
          (basket) =>
            new RequirementViewModel(
              this,
              this,
              this.academicPlanViewModel,
              basket,
            ),
        );

      for (const requirement of this._requirements) {
        for (const basket of requirement.allBaskets) {
          this.basketToRequirementViewModelMap.set(basket, requirement);
        }
      }
    }
    addColorToModulesv2(this._requirements);
    return this._requirements;
  }

  get modulesMap(): Map<string, plan.Module> {
    return this.validatorState.allModules;
  }

  public get startYear(): string {
    return this.academicPlanViewModel.startYear;
  }

  public get moduleYears(): string[] {
    return this.academicPlanViewModel.moduleYears;
  }

  async initializeFromURL(url: string) {
    return this.validatorState.initializeFromURL(url);
  }

  async initializeFromString(text: string) {
    return this.validatorState.initializeFromString(text);
  }

  async loadAcademicPlanFromURL(
    url: string | undefined = this.sampleStudyPlanUrl,
  ) {
    if (!url) {
      return;
    }
    this.loadAcademicPlanFromString(await (await fetch(url)).text());
  }

  loadAcademicPlanFromString(text: string) {
    const mods = this.academicPlanViewModel.loadAcademicPlan(text);
    const modSet = new Set(mods);
    for (const requirement of this.requirements) {
      requirement.filtered((mod) => !modSet.has(mod.code));
    }
  }

  validate() {
    return this.academicPlanViewModel.validate(this.validatorState);
  }

  hydrate(stored: MainViewModel): void {
    this.validatorState.hydrate(stored.validatorState);
    this.academicPlanViewModel.hydrate(stored.academicPlanViewModel);
    this._requirements = undefined;
    this.sampleStudyPlanUrl = stored.sampleStudyPlanUrl;
    this.requirements.forEach((req) => req.hydrate());
  }

  hydrateWithStorageString(storedString: string) {
    const obj = JSON.parse(storedString) as object;
    const instance = plainToInstance(MainViewModel, obj);
    this.hydrate(instance);
  }

  toStorageObject() {
    const obj = instanceToPlain(this, { enableCircularCheck: true });
    return obj;
  }

  toStorageString() {
    return JSON.stringify(this.toStorageObject());
  }
}

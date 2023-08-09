import 'reflect-metadata'; // needed for class-transformer https://github.com/typestack/class-transformer/issues/178
import { Exclude } from "class-transformer";
import { Module, AcademicPlanView, PropertySetFilter } from "./plan";

enum BinaryOp {
  GEQ,
  GT,
}

@Exclude()
class CriterionFulfillmentResult {
  isFulfilled: boolean;
  matchedMCs: number;
  matchedModules: Set<Module>;

  constructor(
    isFulfilled: boolean = false,
    matchedMCs: number = 0,
    matchedModules: Set<Module> = new Set(),
  ) {
    this.isFulfilled = isFulfilled;
    this.matchedMCs = matchedMCs;
    this.matchedModules = matchedModules;
  }

  // This is relatively idempotent
  mergeResult(result: CriterionFulfillmentResult) {
    this.isFulfilled = this.isFulfilled || result.isFulfilled;
    this.matchedMCs = result.matchedMCs;
    for (const mod of result.matchedModules) {
      this.matchedModules.add(mod);
    }
  }
}

abstract class BasketEvent {}

class CriterionMatchModuleEvent extends BasketEvent {
  module: Module;
  constructor(module: Module) {
    super();
    this.module = module;
  }
}

class DoubleCountModuleEvent extends BasketEvent {
  module: Module;
  constructor(module: Module) {
    super();
    this.module = module;
  }
}

interface CriterionEventDelegate {
  acceptEvent(event: BasketEvent): void;
}

export type Constructor<T> = new (...args: any) => T;

export interface Criterion {
  criterionState: CriterionFulfillmentResult;
  eventDelegate?: CriterionEventDelegate;
  isFulfilledWithState(
    academicPlan: AcademicPlanView,
  ): CriterionFulfillmentResult;
}

/**
 * A Basket represents a sub-requirement, in the sense that it can be nested in a larger basket.
 */
@Exclude()
export abstract class Basket implements Criterion, CriterionEventDelegate {
  // This field is purely for display purposes.
  expectedMcs?: number;
  title: string;
  description?: string;
  criterionState: CriterionFulfillmentResult = new CriterionFulfillmentResult();
  parentBasket?: Basket;

  constructor(name: string = "") {
    this.title = name;
  }

  abstract accept<ReturnValue>(
    visitor: BasketVisitor<ReturnValue>,
  ): ReturnValue;

  /**
   * A top level basket is a basket that is the top-level requirement, in other words,
   * it is the degree requirement itself.
   */
  isTopLevelBasket(): boolean {
    return this.parentBasket === undefined;
  }

  /**
   * Returns whether the basket is fulfilled based on the modules present inside the given AcademicPlanView.
   * Don't call this method directly! Call isFulfilledWithState instead.
   */
  protected abstract isFulfilled(
    academicPlan: AcademicPlanView,
  ): CriterionFulfillmentResult;

  /**
   * Returns whether the basket is fulfilled based on the modules present inside the given AcademicPlanView.
   * For external users of the Call this instead of isFulfilled.
   */
  isFulfilledWithState(
    academicPlan: AcademicPlanView,
  ): CriterionFulfillmentResult {
    const fulfilled = this.isFulfilled(academicPlan);
    this.criterionState.mergeResult(fulfilled);
    return this.criterionState;
  }

  abstract childBaskets(): Array<Basket>;

  resetSubtreeState() {
    this.criterionState = new CriterionFulfillmentResult();
    this.childBaskets().forEach((basket) => basket.resetSubtreeState());
  }

  sendEventUpwards(event: BasketEvent) {
    for (
      let current: Basket | undefined = this;
      current !== undefined;
      current = current.parentBasket
    ) {
      current.acceptEvent(event);
    }
  }

  acceptEvent(event: BasketEvent): void {
    if (event instanceof CriterionMatchModuleEvent) {
      event.module.state.matchedBaskets.push(this);
    } else if (event instanceof DoubleCountModuleEvent) {
      event.module.state.matchedBaskets.push(this);
      this.criterionState.matchedModules.add(event.module);
    }
  }

  hasMeaningfulName(): boolean {
    return this.title.length > 0;
  }

  getPrintableClone(meaningfulDepth: number = 2): PrintableBasket {
    const clone = new PrintableBasket(this);
    if (meaningfulDepth > 0) {
      for (const child of this.childBaskets()) {
        if (!child.hasMeaningfulName) {
          clone.children.push(child.getPrintableClone(meaningfulDepth));
        } else {
          clone.children.push(child.getPrintableClone(meaningfulDepth - 1));
        }
      }
    }
    return clone;
  }
}

/**
 * A basket that does not contain any requirement. It is meant to be used as a placeholder.
 */
export class EmptyBasket extends Basket {
  constructor() {
    super("__Empty__");
  }
  accept<ReturnValue>(visitor: BasketVisitor<ReturnValue>): ReturnValue {
    throw new Error("Method not implemented.");
  }
  protected isFulfilled(
    academicPlan: AcademicPlanView,
  ): CriterionFulfillmentResult {
    return new CriterionFulfillmentResult(true, 0, new Set());
  }
  childBaskets(): Basket[] {
    return [];
  }
}

class PrintableCriterionState {
  isFulfilled: boolean;
  matchedMCs: number;
  matchedModules: Array<string> = [];
  constructor(criterionState: CriterionFulfillmentResult) {
    this.isFulfilled = criterionState.isFulfilled;
    this.matchedMCs = criterionState.matchedMCs;
    for (const mod of criterionState.matchedModules) {
      this.matchedModules.push(mod.code);
    }
  }
}

/**
 * A print-friendly class that is useful for debugging.
 */
class PrintableBasket {
  name: string;
  children: Array<PrintableBasket> = [];
  criterionState: PrintableCriterionState;
  constructor(basket: Basket) {
    this.name = basket.title;
    this.criterionState = new PrintableCriterionState(basket.criterionState);
  }
}

export class BasketState {
  moduleCodesAlreadyMatched: Set<string>;
  constructor(moduleCodesAlreadyMatched: Set<string> = new Set()) {
    this.moduleCodesAlreadyMatched = moduleCodesAlreadyMatched;
  }

  reset() {
    this.moduleCodesAlreadyMatched.clear();
  }
}

export abstract class BasketVisitor<ReturnValue> {
  abstract visitStatefulBasket(basket: StatefulBasket): ReturnValue;
  abstract visitArrayBasket(basket: ArrayBasket): ReturnValue;
  abstract visitFulfillmentResultBasket(
    basket: FulfillmentResultBasket,
  ): ReturnValue;
  abstract visitModuleBasket(basket: ModuleBasket): ReturnValue;
  abstract visitMultiModuleBasket(basket: MultiModuleBasket): ReturnValue;

  visit(basket: Basket) {
    return basket.accept<ReturnValue>(this);
  }
}

/**
 * A basket that is meant to prevent undesirable double-counting.
 */
export class StatefulBasket extends Basket {
  basket: Basket;
  state: BasketState;
  constructor(basket: Basket, state: BasketState = new BasketState()) {
    super();
    this.basket = basket;
    this.basket.parentBasket = this;
    this.state = state;
  }

  accept<ReturnValue>(visitor: BasketVisitor<ReturnValue>): ReturnValue {
    return visitor.visitStatefulBasket(this);
  }

  childBaskets(): Basket[] {
    return [this.basket];
  }

  protected isFulfilled(
    academicPlan: AcademicPlanView,
  ): CriterionFulfillmentResult {
    return this.basket.isFulfilledWithState(
      academicPlan.withModulesFilteredBy(
        new PropertySetFilter("code", this.state.moduleCodesAlreadyMatched),
      ),
    );
  }

  override resetSubtreeState() {
    super.resetSubtreeState();
    this.state.reset();
  }

  acceptEvent(event: BasketEvent): void {
    super.acceptEvent(event);
    if (event instanceof CriterionMatchModuleEvent) {
      this.state.moduleCodesAlreadyMatched.add(event.module.code);
    }
  }
}

/**
 * A basket that contains an array of other baskets. It can be used to model
 * a logical OR or a logical AND condition.
 * Generally speaking, use the ArrayBasket.or, ArrayBasket.and, ArrayBasket.atLeastN static methods instead
 * of the constructor.
 */
export class ArrayBasket extends Basket {
  baskets: Array<Basket>;
  binaryOp: BinaryOp;
  n: number;
  earlyTerminate: boolean;

  constructor(
    name: string,
    baskets: Array<Basket>,
    binaryOp: BinaryOp,
    n: number,
    earlyTerminate: boolean,
  ) {
    super(name);
    this.baskets = baskets;
    this.baskets.forEach((basket) => (basket.parentBasket = this));
    this.binaryOp = binaryOp;
    this.n = n;
    this.earlyTerminate = earlyTerminate;
  }

  /**
   * @returns A composite basket with an OR condition over the given baskets.
   */
  static or(name: string, baskets: Array<Basket>): ArrayBasket {
    return new ArrayBasket(name, baskets, BinaryOp.GEQ, 1, true);
  }

  /**
   * @returns A composite basket with an AND condition over the given baskets.
   */
  static and(name: string, baskets: Array<Basket>): ArrayBasket {
    return new ArrayBasket(name, baskets, BinaryOp.GEQ, baskets.length, false);
  }

  /**
   * @returns A composite basket that is fulfilled iff at least n of the given baskets are fulfilled.
   */
  static atLeastN(name: string, n: number, basket: Array<Basket>): ArrayBasket {
    return new ArrayBasket(name, basket, BinaryOp.GEQ, n, true);
  }

  accept<ReturnValue>(visitor: BasketVisitor<ReturnValue>): ReturnValue {
    return visitor.visitArrayBasket(this);
  }

  childBaskets(): Basket[] {
    return this.baskets;
  }

  protected isFulfilled(
    academicPlan: AcademicPlanView,
  ): CriterionFulfillmentResult {
    let fulfilled;
    let fulfilledCount = 0;
    let toMatch = 0;
    switch (this.binaryOp) {
      case BinaryOp.GEQ:
        toMatch = this.n;
        break;
      case BinaryOp.GT:
        toMatch = this.n + 1;
        break;
    }
    if (this.earlyTerminate) {
      for (let basket of this.baskets) {
        if (!basket.isFulfilledWithState(academicPlan).isFulfilled) {
          continue;
        }
        fulfilledCount++;
        if (fulfilledCount >= toMatch) {
          break;
        }
      }
    } else {
      for (let basket of this.baskets) {
        if (!basket.isFulfilledWithState(academicPlan).isFulfilled) {
          continue;
        }
        fulfilledCount++;
      }
    }
    fulfilled = fulfilledCount >= toMatch;

    let totalMCs = 0;
    const allMatchedModules = new Set<Module>();
    for (let basket of this.baskets) {
      totalMCs += basket.criterionState.matchedMCs;
      for (const mod of basket.criterionState.matchedModules) {
        allMatchedModules.add(mod);
      }
    }

    return fulfilled
      ? new CriterionFulfillmentResult(true, totalMCs, allMatchedModules)
      : new CriterionFulfillmentResult(false, totalMCs, allMatchedModules);
  }
  acceptEvent(event: BasketEvent): void {
    super.acceptEvent(event);
  }
}

export class FulfillmentResultBasket extends Basket {
  predicate: (result: CriterionFulfillmentResult) => boolean;
  basket: Basket;
  constructor(
    name: string,
    basket: Basket,
    predicate: typeof FulfillmentResultBasket.prototype.predicate,
  ) {
    super(name);
    this.basket = basket;
    this.basket.parentBasket = this;
    this.predicate = predicate;
  }

  static withCriterion(
    name: string,
    {
      numMCs,
      numberOfModules,
      filter,
    }: Partial<{
      numMCs: number;
      numberOfModules: number;
      filter: ModuleFilter;
    }>,
    basket: Basket,
  ) {
    return new FulfillmentResultBasket(name, basket, (result) => {
      let matchedMCs: number;
      let matchedModuleCount: number;
      if (filter) {
        const matchedModules = Array.from(result.matchedModules).filter(
          filter.filter.bind(filter),
        );
        matchedMCs = 0;
        for (const mod of matchedModules) {
          matchedMCs += mod.credits;
        }

        // TODO: terrible hack pls refactor and change
        matchedMCs = Math.min(matchedMCs, result.matchedMCs);
        matchedModuleCount = matchedModules.length;
      } else {
        matchedMCs = result.matchedMCs;
        matchedModuleCount = result.matchedModules.size;
      }

      if (numMCs && matchedMCs < numMCs) {
        return false;
      }

      if (numberOfModules && matchedModuleCount < numberOfModules) {
        return false;
      }

      return true;
    });
  }

  static atLeastNMCs(name: string, numMCs: number, basket: Basket) {
    return new FulfillmentResultBasket(
      name,
      basket,
      (result) => result.matchedMCs >= numMCs,
    );
  }

  static atLeastNModules(
    name: string,
    numberOfModules: number,
    basket: Basket,
  ) {
    return new FulfillmentResultBasket(
      name,
      basket,
      (result) => result.matchedModules.size >= numberOfModules,
    );
  }

  accept<ReturnValue>(visitor: BasketVisitor<ReturnValue>): ReturnValue {
    return visitor.visitFulfillmentResultBasket(this);
  }

  childBaskets(): Basket[] {
    return [this.basket];
  }

  protected isFulfilled(
    academicPlan: AcademicPlanView,
  ): CriterionFulfillmentResult {
    const fulfilled = this.basket.isFulfilledWithState(academicPlan);
    if (!fulfilled.isFulfilled || !this.predicate(fulfilled)) {
      return new CriterionFulfillmentResult(
        false,
        fulfilled.matchedMCs,
        fulfilled.matchedModules,
      );
    } else {
      return fulfilled;
    }
  }

  acceptEvent(event: BasketEvent): void {
    super.acceptEvent(event);
  }
}

export class ModuleBasket extends Basket {
  module: Module;
  constructor(module: Module) {
    super();
    this.module = module;
  }

  accept<ReturnValue>(visitor: BasketVisitor<ReturnValue>): ReturnValue {
    return visitor.visitModuleBasket(this);
  }

  protected isFulfilled(
    academicPlan: AcademicPlanView,
  ): CriterionFulfillmentResult {
    const found = !!academicPlan
      .getModules()
      .find((m) => m.code == this.module.code);

    if (found) {
      this.sendEventUpwards(new CriterionMatchModuleEvent(this.module));
    }

    return found
      ? new CriterionFulfillmentResult(
          true,
          this.module.credits,
          new Set([this.module]),
        )
      : new CriterionFulfillmentResult(false);
  }

  childBaskets(): Basket[] {
    return [];
  }

  acceptEvent(event: BasketEvent): void {
    super.acceptEvent(event);
  }

  doubleCount() {
    this.criterionState.isFulfilled = true;
    this.sendEventUpwards(new DoubleCountModuleEvent(this.module));
  }
}

export class ModuleFilter {
  moduleCodePattern?: RegExp;
  notModuleCodePattern?: RegExp; // If match `notPattern`, then reject.
  moduleCodePrefix?: Set<string>;
  moduleCodeSuffix?: Set<string>;
  level?: Set<number>;
  codes?: Set<string>;
  constructor(basket: Partial<ModuleFilter>) {
    this.moduleCodePattern = basket.moduleCodePattern;
    this.notModuleCodePattern = basket.notModuleCodePattern;
    this.moduleCodePrefix = basket.moduleCodePrefix;
    this.moduleCodeSuffix = basket.moduleCodeSuffix;
    this.level = basket.level;
    this.codes = basket.codes;
  }

  filter(module: Module) {
    if (this.codes && !this.codes.has(module.code)) {
      return false;
    }

    if (this.moduleCodePattern && !this.moduleCodePattern.test(module.code)) {
      return false;
    }

    if (
      this.notModuleCodePattern &&
      this.notModuleCodePattern.test(module.code)
    ) {
      return false;
    }

    if (
      this.moduleCodePrefix !== undefined &&
      !this.moduleCodePrefix.has(module.prefix)
    ) {
      return false;
    }

    if (
      this.moduleCodeSuffix !== undefined &&
      !this.moduleCodeSuffix.has(module.suffix)
    ) {
      return false;
    }

    if (this.level !== undefined && !this.level.has(module.level)) {
      return false;
    }

    return true;
  }
}

/**
 * A bottom-level basket, i.e. it resides in the leaves of the requirement tree.
 * Represents multiple modules, based on the filter that is assigned to it.
 */
export class MultiModuleBasket extends Basket {
  // A filter to determine what modules can be associated with this basket.
  filter: ModuleFilter;
  get codes(): Set<string> | undefined {
    return this.filter.codes;
  }

  get moduleCodePattern(): RegExp | undefined {
    return this.filter.moduleCodePattern;
  }
  get moduleCodePrefix(): Set<string> | undefined {
    return this.filter.moduleCodePrefix;
  }
  get moduleCodeSuffix(): Set<string> | undefined {
    return this.filter.moduleCodeSuffix;
  }
  get level(): Set<number> | undefined {
    return this.filter.level;
  }

  // Number of mcs required to fulfill this basket.
  // If undefined, then there is no mc requirement.
  requiredMCs?: number;

  // Works together with requiredMCs, i.e. if requiredMCs is undefined, this field is irrelevant.
  // If true, matching stops once the number of MCs matched >= requiredMCs.
  earlyTerminate?: boolean;

  // Specific to the UI.
  respawnable: boolean;
  constructor(basket: Partial<MultiModuleBasket> & { filter: ModuleFilter }) {
    super(basket.title);
    this.filter = basket.filter;
    this.requiredMCs = basket.requiredMCs;
    this.earlyTerminate = basket.earlyTerminate ?? true;
    this.respawnable = basket.respawnable ?? false;
  }

  accept<ReturnValue>(visitor: BasketVisitor<ReturnValue>): ReturnValue {
    return visitor.visitMultiModuleBasket(this);
  }

  childBaskets(): Basket[] {
    return [];
  }

  protected isFulfilled(
    academicPlan: AcademicPlanView,
  ): CriterionFulfillmentResult {
    let filteredModules = academicPlan.getModules().filter((module) => {
      if (this.moduleCodePattern && !this.moduleCodePattern.test(module.code)) {
        return false;
      }

      if (
        this.moduleCodePrefix !== undefined &&
        !this.moduleCodePrefix.has(module.prefix)
      ) {
        return false;
      }

      if (
        this.moduleCodeSuffix !== undefined &&
        !this.moduleCodeSuffix.has(module.suffix)
      ) {
        return false;
      }

      if (this.level !== undefined && !this.level.has(module.level)) {
        return false;
      }

      return true;
    });

    if (this.earlyTerminate && this.requiredMCs !== undefined) {
      // Heuristic: prioritize modules with smaller number of credits
      filteredModules.sort((a, b) => a.credits - b.credits);
      const justEnoughModulesForMCs: Module[] = [];
      for (
        let i = 0, mcs = 0;
        i < filteredModules.length && mcs < this.requiredMCs;
        mcs += filteredModules[i].credits, i++
      ) {
        justEnoughModulesForMCs.push(filteredModules[i]);
      }
      filteredModules = justEnoughModulesForMCs;
    }

    for (const mod of filteredModules) {
      this.sendEventUpwards(new CriterionMatchModuleEvent(mod));
    }

    let totalMCs = 0;
    for (const mod of filteredModules) {
      totalMCs += mod.credits;
    }

    let isFulfilled;
    if (this.requiredMCs === undefined) {
      isFulfilled = true;
    } else {
      isFulfilled = totalMCs >= this.requiredMCs;
    }

    return new CriterionFulfillmentResult(
      isFulfilled,
      totalMCs,
      new Set(filteredModules),
    );
  }

  private setToRegex(set: Set<string>) {
    return `(${Array.from(set).join("|")})`;
  }

  /**
   * @returns A regex pattern converted from the filter.
   */
  getEffectivePattern(): string {
    if (this.moduleCodePattern) {
      return this.moduleCodePattern.source;
    } else if (this.codes) {
      return this.setToRegex(this.codes);
    } else {
      let str: string;
      if (this.level) {
        str = `[${Array.from(this.level).join("")}]\\d{3}`;
      } else {
        str = "\\d{4}";
      }

      if (this.moduleCodePrefix) {
        str = `^${this.setToRegex(this.moduleCodePrefix)}` + str;
      }

      if (this.moduleCodeSuffix) {
        str = str + `${this.setToRegex(this.moduleCodeSuffix)}$`;
      }

      return str;
    }
  }
}

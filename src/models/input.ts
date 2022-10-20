import yaml from "js-yaml";
import { Exclude, Expose } from "class-transformer";
import * as baskets from "./basket";
import * as log from "./log";
import * as plan from "./plan";
import { Hydratable } from "../interfaces/planner";

type Shared<T> = T & {
  tag?: string;
  title?: string;
  description?: string;
  state?: string;
  at_least_n_mcs?: number;
};

type ModuleCode = string;
type ModuleBasket = {
  code?: string;
  mc?: number;
  code_pattern?: string;
  code_prefix?: string;
  code_suffix?: string;
  level?: number;
  double_count?: boolean;
  required_mcs?: number;
  early_terminate?: boolean;
};

type BasketOption = Shared<
  | { at_least_n_of: { n: number; baskets: ArrayBasket } }
  | {
      and: ArrayBasket;
    }
  | {
      or: ArrayBasket;
    }
  | { module: ModuleBasket }
>;

type BasketOptionRecord = {
  [label: string]: BasketOption;
};

type ArrayBasketElement = BasketOptionRecord | ModuleCode;

type ArrayBasket = Array<ArrayBasketElement>;

type TopLevelBasket = BasketOptionRecord;

@Exclude()
export class ValidatorState implements Hydratable {
  static emptyBasket = new baskets.EmptyBasket();
  basket: baskets.Basket;
  readonly allBaskets: Map<string, baskets.Basket>;
  readonly allModules: Map<string, plan.Module>;
  readonly doubleCountedModules: Map<string, Array<baskets.ModuleBasket>>;
  readonly states: Map<string, baskets.BasketState>;
  private readonly tags: Set<string>;

  @Expose()
  private text?: string;

  constructor() {
    this.basket = ValidatorState.emptyBasket;
    this.allBaskets = new Map();
    this.allModules = new Map();
    this.doubleCountedModules = new Map();
    this.states = new Map();
    this.tags = new Set();
  }

  hydrate(stored: this): void {
    if (stored.text !== undefined) {
      this.initializeFromString(stored.text);
    }
  }

  async initializeFromURL(url: string) {
    return this.initializeFromString(
      await fetch(url).then((res) => res.text()),
    );
  }

  async initializeFromString(text: string) {
    this.text = text;
    const topLevelBasket = yaml.load(text) as TopLevelBasket;
    this.tags.clear();
    this.initialize(topLevelBasket);
  }

  isUninitialized(): boolean {
    return this.basket === ValidatorState.emptyBasket;
  }

  initialize(topLevelBasket: TopLevelBasket) {
    this.basket = this.convertBasketOptionRecord(topLevelBasket);
  }

  getAndAddIfNotExists(moduleCode: string, mc: number = 4) {
    if (!this.allModules.has(moduleCode)) {
      this.allModules.set(moduleCode, new plan.Module(moduleCode, "", mc)); // TODO
    }

    return this.allModules.get(moduleCode)!;
  }

  private convertArrayBasketElement(
    arrayBasketElement: ArrayBasketElement,
  ): baskets.Basket {
    if (typeof arrayBasketElement === "string") {
      return this.convertBasketOption({
        title: "",
        module: { code: arrayBasketElement },
      });
    } else {
      return this.convertBasketOptionRecord(arrayBasketElement);
    }
  }

  private convertBasketOption(basketOption: BasketOption): baskets.Basket {
    let basket: baskets.Basket;

    if (basketOption.tag) {
      this.tags.add(basketOption.tag);
    }

    if ("and" in basketOption) {
      const basketElements = basketOption.and.map((arrayBasketElement) =>
        this.convertArrayBasketElement(arrayBasketElement),
      );
      basket = baskets.ArrayBasket.and(
        basketOption.title || "",
        basketElements,
      );
    } else if ("or" in basketOption) {
      const basketElements = basketOption.or.map((arrayBasketElement) =>
        this.convertArrayBasketElement(arrayBasketElement),
      );
      basket = baskets.ArrayBasket.or("", basketElements);
    } else if ("module" in basketOption) {
      if (basketOption.module.code) {
        const mod = this.getAndAddIfNotExists(
          basketOption.module.code,
          basketOption.module.mc,
        );

        for (const tag of this.tags) {
          mod.tags.add(tag);
        }

        const moduleBasket = new baskets.ModuleBasket(mod);
        basket = moduleBasket;
        if (basketOption.module.double_count) {
          if (!this.doubleCountedModules.has(basketOption.module.code)) {
            this.doubleCountedModules.set(basketOption.module.code, []);
          }
          this.doubleCountedModules
            .get(basketOption.module.code)!
            .push(moduleBasket);
        }
      } else if (
        basketOption.module.code_prefix !== undefined ||
        basketOption.module.code_suffix !== undefined ||
        basketOption.module.code_pattern !== undefined ||
        basketOption.module.level
      ) {
        basket = new baskets.MultiModuleBasket({
          moduleCodePrefix: basketOption.module.code_prefix
            ? new Set([basketOption.module.code_prefix])
            : undefined,
          moduleCodeSuffix: basketOption.module.code_suffix
            ? new Set([basketOption.module.code_suffix])
            : undefined,
          moduleCodePattern: basketOption.module.code_pattern
            ? new RegExp(basketOption.module.code_pattern)
            : undefined,
          level: basketOption.module.level
            ? new Set([basketOption.module.level / 1000])
            : undefined,
          requiredMCs: basketOption.module.required_mcs,
          earlyTerminate: basketOption.module.early_terminate,
        });
      } else {
        throw new Error(
          "At least one Module parameter must be given by the config.",
        );
      }
    } else if ("at_least_n_of" in basketOption) {
      const basketElements = basketOption.at_least_n_of.baskets.map(
        (arrayBasketElement) =>
          this.convertArrayBasketElement(arrayBasketElement),
      );
      basket = baskets.ArrayBasket.atLeastN(
        basketOption.title || "",
        basketOption.at_least_n_of.n,
        basketElements,
      );
    } else {
      throw new Error("Malformed config");
    }

    if (basketOption.at_least_n_mcs !== undefined) {
      basket = baskets.FulfillmentResultBasket.atLeastNMCs(
        "",
        basketOption.at_least_n_mcs,
        basket,
      );
    }

    if (basketOption.state) {
      if (!this.states.has(basketOption.state)) {
        this.states.set(basketOption.state, new baskets.BasketState());
      }
      basket = new baskets.StatefulBasket(
        basket,
        this.states.get(basketOption.state),
      );
    }

    if (basketOption.description) {
      basket.description = basketOption.description;
    }

    if (basketOption.tag) {
      this.tags.delete(basketOption.tag);
    }

    return basket;
  }

  private convertBasketOptionRecord(basketOptionRecord: BasketOptionRecord) {
    const label = Object.keys(basketOptionRecord)[0];
    const basketOption = basketOptionRecord[label] as BasketOption;
    const basket = this.convertBasketOption(basketOption);
    this.allBaskets.set(label, basket);
    // If no title is explicitly specified, the label will be used.
    // In other words, an explicitly specified title will be able to override the label
    if (basket.title === "") {
      basket.title = label;
    }
    return basket;
  }
}

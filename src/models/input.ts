import yaml from "js-yaml";
import * as baskets from "./basket";
import * as log from "./log";
import * as plan from "./plan";

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

export class ValidatorState {
  static emptyBasket = new baskets.EmptyBasket();
  basket: baskets.Basket;
  allModules: Map<string, plan.Module>;
  doubleCountedModules: Map<string, Array<baskets.ModuleBasket>>;
  states: Map<string, baskets.BasketState>;
  private tags: Set<string>;
  constructor() {
    this.basket = ValidatorState.emptyBasket;
    this.allModules = new Map();
    this.doubleCountedModules = new Map();
    this.states = new Map();
    this.tags = new Set();
  }

  async initializeFromURL(url: string) {
    const topLevelBasket = await fetchBasketFromRepo(url);
    this.tags.clear();
    this.initialize(topLevelBasket);
    // debugger;
    console.assert(this.tags.size === 0);
  }

  isUninitialized(): boolean {
    return this.basket === ValidatorState.emptyBasket;
  }

  initialize(topLevelBasket: TopLevelBasket) {
    this.basket = this.convertBasketOptionRecord(topLevelBasket);
  }

  private getAndAddIfNotExists(moduleCode: string, mc: number = 4) {
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
      // debugger;
      this.tags.delete(basketOption.tag);
    }

    return basket;
  }

  private convertBasketOptionRecord(basketOptionRecord: BasketOptionRecord) {
    const label = Object.keys(basketOptionRecord)[0];
    const basketOption = basketOptionRecord[label] as BasketOption;
    const basket = this.convertBasketOption(basketOption);
    basket.title = label;
    return basket;
  }
}

export function fetchBasketFromRepo(url: string): Promise<TopLevelBasket> {
  return fetch(url)
    .then((res) => res.text())
    .then((text) => yaml.load(text) as TopLevelBasket);
}

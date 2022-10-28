import * as models from "../models";
export type PrereqTree = string | { and?: PrereqTree[]; or?: PrereqTree[] };

export interface Module {
  readonly id: string;
  color?: string;
  readonly code: string;
  name: string;
  credits: number | null;
  editable?: boolean;
  prereqs?: PrereqTree | null;
  preclusions?: string[] | null;
  prereqsViolated?: PrereqTree[] | null;
  coreqs?: string[] | null;
  coreqsViolated?: string[] | null;
  tags?: string[];
  isMultiModule?: boolean;
  getUnderlyingModule?(): models.Module | undefined;
  getMatchedRequirements?(): models.RequirementViewModel[];
  selectModule?(module: models.Module): void; // specific to MultiModule
}

export interface Requirement {
  title: string;
  description: string;
  modules: Module[];
  respawnables: Module[];
  expectedMcs?: number;
}

export interface Semester {
  year: number;
  semester: number;
  modules: Module[];
}

export interface ModulesState {
  requirements: Requirement[];
  planner: Semester[];
  exemptions: Module[];
  startYear: string;
}

export interface Hydratable {
  hydrate(stored: this): void;
}

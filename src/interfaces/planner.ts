import * as models from "../models";
export type PrereqTree = string | { and?: PrereqTree[]; or?: PrereqTree[] };

export interface Module {
  color?: string;
  code: string;
  name: string;
  credits: number | null;
  editable?: boolean;
  prereqs?: PrereqTree | null;
  preclusions?: string[] | null;
  prereqsViolated?: string[][] | null;
  tags?: string[];
  getUnderlyingModule?(): models.Module | undefined;
}

export interface Requirement {
  title: string;
  description: string;
  totalCredits: number;
  modules: Module[];
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

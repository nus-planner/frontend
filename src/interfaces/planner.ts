export interface Module {
  code: string;
  name: string;
  credits: number;
  editable?: boolean;
};

export interface Requirement {
  title: string;
  description: string;
  modules: Module[];
}

export interface ModulesState {
  requirements: Requirement[];
  planner: Module[][];
  startYear: string;
}
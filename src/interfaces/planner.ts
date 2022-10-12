export interface Module {
  color?: string;
  code: string;
  name: string;
  credits: number;
  editable?: boolean;
};

export interface Requirement {
  title: string;
  description: string;
  totalCredits: number;
  modules: Module[];
}

export interface Semester {
  year: number;
  semester: number;
  modules: Module[]
}

export interface ModulesState {
  requirements: Requirement[];
  planner: Semester[];
  startYear: string;
}
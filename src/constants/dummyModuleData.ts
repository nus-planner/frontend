import { Module, ModulesState, Requirement } from "../interfaces/planner";

export const dummyModuleState: ModulesState = {
  requirements: [
    {
      title: "Core Modules",
      description: "Core module description",
      modules: [
        { code: "CS3243", name: "Programming Methodology", credits: 4 },
        { code: "CS3244", name: "Discrete Structures", credits: 4 },
      ],
    },
    {
      title: "Elective Modules",
      description: "Elective module description",
      modules: [
        { code: "CS3216", name: "Bad Module", credits: 4 },
        { code: "CS3217", name: "Ok Module", credits: 4 },
      ],
    },
  ],
  planner: [
    [
      { code: "CS1101S", name: "Programming Methodology", credits: 4 },
      { code: "CS1231S", name: "Discrete Structures", credits: 4 },
    ],
    [
      { code: "CS2030S", name: "Programming Methodology II", credits: 4 },
      { code: "CS2040S", name: "Data Structures and Algorithms", credits: 4 },
    ],
  ],

  startSem: 201901,
};

// TODO: Complete requirements here based on AY1920 CS degree requirements
export const sampleModuleRequirements: Requirement[] = [
  {
    title: "Computer Science Foundation",
    description: "CS foundation description",
    modules: [
      { code: "CS1101S", name: "Programming Methodology", credits: 4 },
      { code: "CS1231S", name: "Discrete Structures", credits: 4 },
      { code: "CS2030S", name: "Programming Methodology II", credits: 4 },
      { code: "CS2040S", name: "Data Structures and Algorithms", credits: 4 },
      { code: "CS2103T", name: "Software Engineering", credits: 4 },
      { code: "CS2100", name: "Computer Organisation", credits: 4 },
      { code: "CS3230", name: "Design and Analysis of Algorithms", credits: 4 },
    ],
  },
  {
    title: "IT Professionalism",
    description: "IT professionalism description",
    modules: [
      { code: "IS1103", name: "Ethics in Computing", credits: 4 },
      {
        code: "CS2101",
        name: "Effective Communication for Computing Professionals",
        credits: 4,
      },
      { code: "ES2660", name: "Communivation in the Digital Age", credits: 4 },
    ],
  },
];

// Complete study plan yy help me pls ;-;
export const sampleStudyPlan: Module[][] = [
  [
    { code: "CS1101S", name: "Programming Methodology", credits: 4 },
    { code: "CS1231S", name: "Discrete Structures", credits: 4 },
    { code: "IS1103", name: "Ethics in Computing", credits: 4 },
  ],
  [
    { code: "CS2030S", name: "Programming Methodology II", credits: 4 },
    { code: "CS2040S", name: "Data Structures and Algorithms", credits: 4 },
    { code: "ES2660", name: "Communivation in the Digital Age", credits: 4 },
  ],
  [
    { code: "CS2100", name: "Computer Organisation", credits: 4 },
    { code: "CS2103T", name: "Software Engineering", credits: 4 },
    {
      code: "CS2101",
      name: "Effective Communication for Computing Professionals",
      credits: 4,
    },
    { code: "CS3230", name: "Design and Analysis of Algorithms", credits: 4 },
  ],
];

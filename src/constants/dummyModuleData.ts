import { Module, ModulesState, Requirement } from "../interfaces/planner";

// TODO: Complete requirements here based on AY1920 CS degree requirements
// Note: How 'any' modules are currently implemented is essentially "any ___":<number>
//       This obviously won't be the case when parsing the yaml file, so we need to do either
//       (1) Find another representation (2) Convert the yaml modules to this representation
export const sampleModuleRequirements: Requirement[] = [
  {
    title: "Computer Science Foundation",
    description: "Compulsory modules",
    totalCredits: 36,
    modules: [
      {
        category: 1,
        code: "CS1101S",
        name: "Programming Methodology",
        credits: 4,
      },
      { category: 1, code: "CS1231S", name: "Discrete Structures", credits: 4 },
      {
        category: 1,
        code: "CS2030S",
        name: "Programming Methodology II",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2040S",
        name: "Data Structures and Algorithms",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2100",
        name: "Computer Organisation",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2103T",
        name: "Software Engineering",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2105",
        name: "Introduction to Computer Networks",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2106",
        name: "Introduction to Operating Systems",
        credits: 4,
      },
      {
        category: 1,
        code: "CS3230",
        name: "Design and Analysis of Algorithms",
        credits: 4,
      },
    ],
  },
  {
    title: "Focus Area and Level-4000",
    description:
      "1. 3 modules in the Area Primaries, with at least one module at level-4000 or above. " +
      "2. At least 12 MCs are at level-4000 or above.",
    totalCredits: 24,
    modules: [
      {
        category: 2,
        code: "Any Primary:1",
        name: "Select A Module",
        credits: null,
      },
      {
        category: 2,
        code: "Any Primary:2",
        name: "Select A Module",
        credits: null,
      },
      {
        category: 2,
        code: "Any Primary:3",
        name: "Select A Module",
        credits: null,
      },
    ],
  },
  {
    title: "Computer Systems Team Project",
    description:
      "At least 8 MCs of Computer Systems Team Project modules. CS3216 and CS3217, CS3281 and CS3282 " +
      "are to be taken together",
    totalCredits: 8,
    modules: [
      {
        category: 3,
        code: "CS3203",
        name: "Software Engineering Project",
        credits: 8,
      },
      {
        category: 3,
        code: "CS3216",
        name: "Software Product Engineering for Digital Markets",
        credits: 5,
      },
      {
        category: 3,
        code: "CS3217",
        name: "Software Engineering on Modern Application Platforms",
        credits: 5,
      },
      {
        category: 3,
        code: "CS3281",
        name: "Thematic Systems Project I",
        credits: 4,
      },
      {
        category: 3,
        code: "CS3282",
        name: "Thematic Systems Project II",
        credits: 4,
      },
    ],
  },
  {
    title: "IT Professionalism",
    description: "",
    totalCredits: 12,
    modules: [
      {
        category: 4,
        code: "IS1103/X",
        name: "IS Innovations in Organisations and Society",
        credits: 4,
      },
      {
        category: 4,
        code: "CS2101",
        name: "Effective Communication for Computing Professionals",
        credits: 4,
      },
      {
        category: 4,
        code: "ES2660",
        name: "Communicating in the Information Age",
        credits: 4,
      },
    ],
  },
  {
    title: "Mathematics and Sciences",
    description: "",
    totalCredits: 16,
    modules: [
      {
        category: 5,
        code: "MA1521",
        name: "Calculus for Computing",
        credits: 4,
      },
      {
        category: 5,
        code: "MA1101R",
        name: "Linear Algebra I or MA2001 Linear Algebra I",
        credits: 4,
      },
      {
        category: 5,
        code: "ST2334",
        name: "Probability and Statistics 5 and one Science Module",
        credits: 8,
      },
    ],
  },
  {
    title: "Elective Modules",
    description: "",
    totalCredits: 32,
    modules: [
      { category: 6, code: "Any UE:1", name: "Select A Module", credits: null },
      { category: 6, code: "Any UE:2", name: "Select A Module", credits: null },
      { category: 6, code: "Any UE:3", name: "Select A Module", credits: null },
      { category: 6, code: "Any UE:4", name: "Select A Module", credits: null },
      { category: 6, code: "Any UE:5", name: "Select A Module", credits: null },
      { category: 6, code: "Any UE:6", name: "Select A Module", credits: null },
      { category: 6, code: "Any UE:7", name: "Select A Module", credits: null },
      { category: 6, code: "Any UE:8", name: "Select A Module", credits: null },
    ],
  },
];

export const dummyModuleState: ModulesState = {
  requirements: JSON.parse(JSON.stringify(sampleModuleRequirements)),
  planner: [
    {
      year: 1,
      semester: 1,
      modules: [],
    },
    {
      year: 1,
      semester: 2,
      modules: [],
    },
    {
      year: 2,
      semester: 1,
      modules: [],
    },
    {
      year: 2,
      semester: 2,
      modules: [],
    },
    {
      year: 3,
      semester: 1,
      modules: [],
    },
    {
      year: 3,
      semester: 2,
      modules: [],
    },
    {
      year: 4,
      semester: 1,
      modules: [],
    },
    {
      year: 4,
      semester: 2,
      modules: [],
    },
  ],

  startYear: "",
};

// Complete study plan yy help me pls ;-;
// export const sampleStudyPlan: Module[][] = [
//   [
//     { code: "CS1101S", name: "Programming Methodology", credits: 4 },
//     { code: "CS1231S", name: "Discrete Structures", credits: 4 },
//     { code: "IS1103", name: "Ethics in Computing", credits: 4 },
//   ],
//   [
//     { code: "CS2030S", name: "Programming Methodology II", credits: 4 },
//     { code: "CS2040S", name: "Data Structures and Algorithms", credits: 4 },
//     { code: "ES2660", name: "Communivation in the Digital Age", credits: 4 },
//   ],
//   [
//     { code: "CS2100", name: "Computer Organisation", credits: 4 },
//     { code: "CS2103T", name: "Software Engineering", credits: 4 },
//     {
//       code: "CS2101",
//       name: "Effective Communication for Computing Professionals",
//       credits: 4,
//     },
//     { code: "CS3230", name: "Design and Analysis of Algorithms", credits: 4 },
//   ],
// ];

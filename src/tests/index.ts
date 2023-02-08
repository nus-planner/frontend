import * as runner from "./runner";
const pathToRequirements = process.argv[2];
const pathToAcadPlan = process.argv[3];
console.log({
  requirements: pathToRequirements,
  "acad plan": pathToAcadPlan,
});

runner.verify(pathToRequirements, pathToAcadPlan);

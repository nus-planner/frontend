import * as runner from "./runner";
import {LocalStorage} from 'node-localstorage'

const pathToRequirements = process.argv[2];
const pathToAcadPlan = process.argv[3];
console.log({
  requirements: pathToRequirements,
  "acad plan": pathToAcadPlan,
});

// polyfill localStorage in a node env
var localStorage =  new LocalStorage('./temp')

runner.verify(pathToRequirements, pathToAcadPlan);

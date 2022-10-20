import moduleList1920 from "./moduleList1920.json";
import moduleList2021 from "./moduleList2021.json";
import moduleList2122 from "./moduleList2122.json";
import moduleList2223 from "./moduleList2223.json";
import { moduleListInterface } from "../../src/utils/plannerUtils";

const moduleList = moduleList1920.concat(
  moduleList2021,
  moduleList2122,
  moduleList2223,
) as moduleListInterface[];

export default moduleList;

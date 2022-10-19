import {
  Button,
  Heading,
  Select,
  Box,
  HStack,
  Stack,
  StackDivider,
  VStack,
  Divider,
  FormControl,
} from "@chakra-ui/react";
import { useState, useCallback, useEffect, SetStateAction } from "react";
import { Module, Requirement, ModulesState } from "../interfaces/planner";
import { insertAtIndex, removeAtIndex } from "../utils/dndUtils";
import RequirementContainer from "../components/RequirementContainer";
import PlannerContainer from "../components/PlannerContainer";
import ExemptionContainer from "../components/ExemptionContainer";
import BasicInfo from "../components/BasicInfo";
import {
  dummyModuleState,
  sampleModuleRequirements,
  majors,
  specialisations,
} from "../constants/dummyModuleData";
import { DragDropContext } from "react-beautiful-dnd";
import {
  addColorToModules,
  applyPrereqValidation,
  testPrereqTree,
  testPrereqTreeMods,
} from "../utils/moduleUtils";
import { fetchModulePrereqs } from "../api/moduleAPI";
import MiddlewarePlugin from "next/dist/build/webpack/plugins/middleware-plugin";

interface Container {
  id: string;
  containerType: "requirement" | "planner" | "";
}

// Notes about design:
//
// Container id naming scheme:
// For requirements: requirement:<array idx>
// For planner: planner:<array idx>
//
// State Tracking of Modules:
// The state of all modules displayed are tracked in `moduleMap`, where each module code is mapped to the module struct

const Home = () => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const [moduleRequirements, setModuleRequirements] = useState(
    addColorToModules(sampleModuleRequirements),
  );

  const moduleRequirementsCodes = sampleModuleRequirements.map((x) =>
    x.modules.map((mod) => mod.code),
  );

  const [modulesState, setModulesState] = useState<ModulesState>({
    ...dummyModuleState,
    requirements: moduleRequirements,
  });

  // list of all available modules
  const moduleMap = new Map<string, Module>();
  for (let requirement of moduleRequirements) {
    for (let mod of requirement.modules) {
      moduleMap.set(mod.code, mod);
    }
  }

  const sortRequirementModules = (): void => {
    const modReqMap = new Map();
    setModulesState((state) => {
      for (let requirement of state.requirements) {
        for (let mod of requirement.modules) {
          modReqMap.set(mod.code, mod);
        }
      }

      // console.log(modReqMap);
      // console.log(moduleRequirementsCodes);

      for (let i = 0; i < moduleRequirementsCodes.length; i++) {
        state.requirements[i].modules = [];
        for (let code of moduleRequirementsCodes[i]) {
          if (modReqMap.has(code)) {
            state.requirements[i].modules.push(modReqMap.get(code));
          }
        }
      }

      return state;
    });
    forceUpdate();
  };

  const handleDragEnd = (event: any) => {
    const { source, destination, draggableId } = event;
    // e.g.
    // source = { index: 0, droppableId: "requirement:4" }
    // destination = { index: 2, droppableId: "requirement:4" }
    // CS1231S

    if (!destination) return;

    const [sourceType, sourceId] = source.droppableId.split(":");
    const [destinationType, destinationId] = destination.droppableId.split(":");

    moveModule(
      sourceType,
      parseInt(sourceId),
      source.index,
      destinationType,
      parseInt(destinationId),
      destination.index,
      draggableId,
    );
  };

  const moveModule = async (
    sourceType: string,
    sourceId: number,
    sourceIndex: number,
    destinationType: string,
    destinationId: number,
    destinationIndex: number,
    draggableId: string,
  ) => {
    const state = { ...modulesState };

    // Removes module from planner or requirements list
    // Note: You have to filter through everything when sourceType is requirement
    // Reason: A mod (e.g. CS2103T) can appear more than once in requirements list
    if (sourceType === "planner") {
      state.planner[sourceId].modules = removeAtIndex(
        state.planner[sourceId].modules,
        sourceIndex,
      );
    } else if (sourceType === "requirement") {
      state.requirements = state.requirements.map((x) => ({
        ...x,
        modules: x.modules.filter((mod) => mod.code !== draggableId),
      }));
    }

    if (!moduleMap.has(draggableId)) return state;

    const mod = moduleMap.get(draggableId);
    if (mod === undefined) return;
    mod.prereqsViolated = [];

    // Adds module into planner or requirements list
    // Requirement can appear more than once, so just insert at the beginning and sort after
    if (destinationType == "requirement") {
      state.requirements[0].modules.push(mod);
    } else if (destinationType == "planner") {
      console.log(destinationId, destinationIndex);
      state.planner[destinationId].modules = insertAtIndex(
        state.planner[destinationId].modules,
        destinationIndex,
        mod,
      );
    }

    console.log("state");
    console.log(state);
    state.planner = await applyPrereqValidation(state.planner);

    setModulesState(state);
    sortRequirementModules();
    forceUpdate();
  };

  const handleModuleClose = async (module: Module) => {
    console.log("handle module close", module.code);
    console.log(modulesState);
    module.prereqsViolated = [];
    const state = { ...modulesState };
    state.planner = state.planner.map((x) => ({
      ...x,
      modules: x.modules.filter((mod) => mod.code !== module.code),
    }));
    state.requirements[0].modules.push(module);
    state.planner = await applyPrereqValidation(state.planner);

    console.log(state);

    setModulesState(state);
    sortRequirementModules();
    forceUpdate();
  };

  // Basic info of the user
  const years = [];
  const currYear = new Date().getFullYear();
  // Assume a student stays in NUS for at most 5 years
  for (let i = 0; i < 5; i++) {
    years.push(currYear - i);
  }
  // Assume standard max 4 years since no double degree
  const plannerYear = [1, 2, 3, 4];
  const plannerSemester = [
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2],
  ];

  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
  const [specialisation, setSpecialisation] = useState("");
  const handleYearChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setYear(event.target.value);
    console.log(plannerYear);
  };
  const handleMajorChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setMajor(event.target.value);
  };
  const handleSpecialisationChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setSpecialisation(event.target.value);
  };

  return (
    <Stack padding="1rem">
      <HStack spacing={"3rem"}>
        <Heading fontSize={"2xl"} fontWeight={"bold"} fontFamily={"body"}>
          NUS Planner
        </Heading>
        <FormControl w="-moz-fit-content">
          <Select
            placeholder="Choose your enrollment year"
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <option key={year}>
                AY{year}/{year + 1}
              </option>
            ))}
          </Select>
        </FormControl>

        {year && (
          <FormControl w="-moz-fit-content">
            <Select
              placeholder="Choose your major"
              onChange={handleMajorChange}
            >
              {majors.map((major) => (
                <option key={major}>{major}</option>
              ))}
            </Select>
          </FormControl>
        )}

        {year && major && (
          <FormControl w="-moz-fit-content">
            <Select
              placeholder="Choose your focus area"
              onChange={handleSpecialisationChange}
            >
              {specialisations.map((specialisation) => (
                <option key={specialisation}>{specialisation}</option>
              ))}
            </Select>
          </FormControl>
        )}
      </HStack>

      <div />
      <Divider />
      <Heading
        fontSize={"xl"}
        fontWeight={"bold"}
        fontFamily={"body"}
        padding="1rem 0rem"
      >
        Required Modules
      </Heading>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box bgColor="blackAlpha.50">
          {modulesState.requirements.map((requirement, id) => (
            <RequirementContainer
              requirement={requirement}
              id={"requirement:" + id.toString()}
              key={id}
            />
          ))}
        </Box>

        <HStack padding="1.5em 1em 0.5em">
          <Heading
            fontSize={"xl"}
            fontWeight={"bold"}
            fontFamily={"body"}
            paddingRight="1em"
          >
            Study Plan
          </Heading>
          <Button size="sm" colorScheme={"white"} variant="outline">
            + Populate Study Plan
          </Button>
        </HStack>
        <Box margin="0em 0.5em 4em" borderColor="black" padding="0.5em">
          <HStack align="top">
            {plannerYear.map((year) => (
              <PlannerContainer
                year={year}
                semesters={plannerSemester[year - 1]}
                plannerSemesters={modulesState.planner}
                handleModuleClose={handleModuleClose}
                id={year.toString()}
                key={year}
              />
            ))}
          </HStack>
        </Box>

        <div>
          <Heading
            fontSize={"xl"}
            fontWeight={"bold"}
            fontFamily={"body"}
            padding="0em 1em 0.5em"
          >
            Exemptions
          </Heading>
          <Box margin="0em 0.5em 4em" borderColor="black" padding="0.5em" w='16rem'>
            <ExemptionContainer
              exemptedModules={modulesState.planner[0].modules}
              handleModuleClose={handleModuleClose}
              id={"planner:0"}
            />
          </Box>
        </div>
      </DragDropContext>
    </Stack>
  );
};

export default Home;

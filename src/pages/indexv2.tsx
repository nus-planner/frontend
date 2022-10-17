import {
  Button,
  Heading,
  Select,
  Box,
  HStack,
  StackDivider,
  VStack,
} from "@chakra-ui/react";
import { useState, useCallback, useEffect } from "react";
import { Module, Requirement, ModulesState } from "../interfaces/planner";
import { insertAtIndex, removeAtIndex } from "../utils/dndUtils";
import RequirementContainer from "../components/RequirementContainer";
import PlannerContainer from "../components/PlannerContainer";
import {
  dummyModuleState,
  sampleModuleRequirements,
} from "../constants/dummyModuleData";
import { DragDropContext } from "react-beautiful-dnd";
import {
  addColorToModules,
  applyPrereqValidation,
  testPrereqTree,
  testPrereqTreeMods,
} from "../utils/moduleUtils";
import { fetchModulePrereqs } from "../api/moduleAPI";
import * as models from "../models";
import reqStr from "../constants/moduleReq";

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
  const [mainViewModel, setMainViewModel] = useState(
    new models.MainViewModel(2020, 4),
  );

  useEffect(() => {
    mainViewModel
      .initializeFromString(reqStr)
      // .initializeFromURL(
      //   "https://raw.githubusercontent.com/nus-planner/frontend/main/locals/requirements/cs-2019.json",
      // )
      .then(forceUpdate);
  }, []);

  const moduleRequirements = mainViewModel.requirements;

  const moduleRequirementsCodes = moduleRequirements.map((x) =>
    x.modules.map((mod) => mod.code),
  );

  // list of all available modules
  const moduleMap = mainViewModel.moduleViewModelsMap;
  for (let requirement of moduleRequirements) {
    for (let moduleViewModel of requirement.modules) {
      moduleMap.set(moduleViewModel.code, moduleViewModel);
    }
  }

  const sortRequirementModules = (): void => {
    const modReqMap = new Map();
    const state = mainViewModel;
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
    const state = mainViewModel;

    // Removes module from planner or requirements list
    // Note: You have to filter through everything when sourceType is requirement
    // Reason: A mod (e.g. CS2103T) can appear more than once in requirements list
    if (sourceType === "planner") {
      state.planner[sourceId].removeAtIndex(sourceIndex);
    } else if (sourceType === "requirement") {
      for (const requirement of state.requirements) {
        requirement.filtered((mod) => mod.code !== draggableId);
      }
    }

    if (!moduleMap.has(draggableId)) return state;

    const modViewModel = moduleMap.get(draggableId);
    if (modViewModel === undefined) return;
    modViewModel.prereqsViolated = [];

    // Adds module into planner or requirements list
    // Requirement can appear more than once, so just insert at the beginning and sort after
    if (destinationType == "requirement") {
      state.requirements[0].modules.push(modViewModel);
    } else if (destinationType == "planner") {
      console.log(destinationId, destinationIndex);
      state.planner[destinationId].addModuleAtIndex(
        modViewModel,
        destinationIndex,
      );
    }

    console.log("state");
    console.log(state);
    await applyPrereqValidation(state.planner);

    forceUpdate();
    sortRequirementModules();
  };

  const handleModuleClose = async (module: Module) => {
    console.log("handle module close", module.code);

    module.prereqsViolated = [];
    const state = mainViewModel;
    for (const semester of state.planner) {
      semester.filtered((mod) => mod.code !== module.code);
    }
    state.requirements[0].modules.push(module);
    await applyPrereqValidation(state.planner);

    console.log(state);

    sortRequirementModules();
    forceUpdate();
  };

  return (
    <div>
      <HStack padding="1em 0.8em 0.1em 1.2em">
        <Heading
          fontSize={"2xl"}
          fontWeight={"bold"}
          fontFamily={"body"}
          paddingRight="1em"
        >
          NUS Planner
        </Heading>
        <Select placeholder="Choose your year" width={"15rem"} padding="">
          <option>AY2019/2020</option>
        </Select>
        <Select placeholder="Choose your major" width={"15rem"} padding="">
          <option>Computer Science</option>
        </Select>
        <Select placeholder="Choose your focus area" width={"15rem"}>
          <option>Algorithms & Theory</option>
        </Select>
      </HStack>

      <div />
      <Heading
        fontSize={"xl"}
        fontWeight={"bold"}
        fontFamily={"body"}
        padding="1em 1em 0.5em"
      >
        Required Modules
      </Heading>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box bgColor="purple.50" margin="0em 1em 0em 1em" borderColor="black">
          {mainViewModel.requirements.map((requirementViewModel, id) => (
            <RequirementContainer
              requirement={requirementViewModel}
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
            {mainViewModel.planner.map((semester, id) => (
              <PlannerContainer
                semester={semester}
                handleModuleClose={handleModuleClose}
                id={"planner:" + id.toString()}
                key={id}
              />
            ))}
          </HStack>
        </Box>
      </DragDropContext>
    </div>
  );
};

export default Home;

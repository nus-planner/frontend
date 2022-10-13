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
import { DragDropContext} from "react-beautiful-dnd";
import { addColorToModules, applyPrereqValidation } from "../utils/moduleUtils";

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
    addColorToModules(sampleModuleRequirements)
  );

  const moduleRequirementsCodes = sampleModuleRequirements.map((x) =>
    x.modules.map((mod) => mod.code)
  );

  const [modulesState, setModulesState] = useState<ModulesState>({
    ...dummyModuleState,
    requirements: moduleRequirements,
  });

  // list of all available modules
  const moduleMap = new Map<string, Module>();
  for (let requirement of moduleRequirements) {
    for (let module of requirement.modules) {
      moduleMap.set(module.code, module);
    }
  }


  const sortRequirementModules = (): void => {
    const modReqMap = new Map();
    setModulesState((state) => {
      for (let requirement of state.requirements) {
        for (let module of requirement.modules) {
          modReqMap.set(module.code, module);
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

  const handleDragEnd = (event) => {
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
      sourceId,
      source.index,
      destinationType,
      destinationId,
      destination.index,
      draggableId
    );
  };

  const moveModule = (
    sourceType,
    sourceId,
    sourceIndex,
    destinationType,
    destinationId,
    destinationIndex,
    draggableId
  ) => {
    setModulesState((state) => {
      // Removes module from planner or requirements list
      // Note: You have to filter through everything when sourceType is requirement
      // Reason: A mod (e.g. CS2103T) can appear more than once in requirements list
      if (sourceType === "planner") {
        state.planner[sourceId].modules = removeAtIndex(
          state.planner[sourceId].modules,
          sourceIndex
        );
      } else if (sourceType === "requirement") {
        state.requirements = state.requirements.map((x) => ({
          ...x,
          modules: x.modules.filter((mod) => mod.code !== draggableId),
        }));
      }

      if (!moduleMap.has(draggableId)) return state;

      const mod = moduleMap.get(draggableId);
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
          mod
        );
      }

      console.log("state");
      console.log(state);
      state.planner = applyPrereqValidation(state.planner);

      return state;
    });
    sortRequirementModules();
  };

  const handleModuleClose = (module: Module) => {
    console.log("handle module close", module.code);
    console.log(modulesState);
    module.prereqsViolated = [];
    setModulesState((state) => {
      state.planner = state.planner.map((x) => ({
        ...x,
        modules: x.modules.filter((mod) => mod.code !== module.code),
      }));
      state.requirements[0].modules.push(module);
      state.planner = applyPrereqValidation(state.planner);
      
      forceUpdate();
      return state;
    });

    console.log(modulesState);

    sortRequirementModules();
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
        <Select
          placeholder="Choose your enrollment year"
          width={"15rem"}
          padding=""
        >
          <option>AY2019/2020</option>
        </Select>
        <Select placeholder="Choose your major" width={"15rem"} padding="">
          <option>Computer Science</option>
        </Select>
        <Select placeholder="Choose your focus areea" width={"15rem"}>
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
        <div className="verscroll">
          <Box
            bgColor="purple.50"
            margin="1em 1em 4em"
            borderColor="black"
            padding="0.5em"
            borderRadius="0.5em"
          >
            <VStack
              align="left"
              divider={<StackDivider borderColor="purple.100" />}
            >
              {modulesState.requirements.map((requirement, id) => (
                <RequirementContainer
                  requirement={requirement}
                  id={"requirement:" + id.toString()}
                  key={id}
                />
              ))}
            </VStack>
          </Box>
        </div>
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
            + New Semester
          </Button>
        </HStack>
        <Box margin="0em 0.5em 4em" borderColor="black" padding="0.5em">
          <HStack align="top">
            {modulesState.planner.map((semester, id) => (
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

import { Button, Heading, Box, HStack } from "@chakra-ui/react";
import {
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { Module } from "../interfaces/planner";
import RequirementContainer from "./RequirementContainer";
import StudyPlanContainer from "./StudyPlanContainer";
import ExemptionContainer from "./ExemptionContainer";
import { DragDropContext } from "react-beautiful-dnd";
import { applyPrereqValidation } from "../utils/moduleUtils";

import { MainViewModel } from "../models";
import ValidateStudyPlanButton from "./ValidateStudyPlanButton";

interface PlannerProps {
  mainViewModel: MainViewModel;
  setMainViewModel: Dispatch<SetStateAction<MainViewModel>>;
}

// Notes about design:
//
// Container id naming scheme:
// For requirements: requirement:<array idx>
// For planner: planner:<array idx>
//
// State Tracking of Modules:
// The state of all modules displayed are tracked in `moduleMap`, where each module code is mapped to the module struct

const Planner = ({ mainViewModel, setMainViewModel }: PlannerProps) => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

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
        requirement.filtered((mod) => mod.code !== draggableId.split("|")[0]);
      }
    }

    if (!moduleMap.has(draggableId.split("|")[0])) return state;

    const modViewModel = moduleMap.get(draggableId.split("|")[0]);
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

  // Assume standard max 4 years since no double degree
  const plannerYears = [1, 2, 3, 4];
  const [plannerSemesters, setPlannerSemesters] = useState<number[][]>([
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2],
  ]);

  return (
    <div>
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
          {mainViewModel.requirements.map((requirement, id) => (
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
          <ValidateStudyPlanButton mainViewModel={mainViewModel} />
        </HStack>
        <Box margin="0em 0.5em 4em" borderColor="black" padding="0.5em">
          <HStack align="top">
            {plannerYears.map((year) => (
              <StudyPlanContainer
                year={year}
                semesters={plannerSemesters[year - 1]}
                plannerSemesters={mainViewModel.planner}
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
          <Box
            margin="0em 0.5em 4em"
            borderColor="black"
            padding="0.5em"
            w="16rem"
          >
            <ExemptionContainer
              exemptedModules={mainViewModel.planner[0].modules}
              handleModuleClose={handleModuleClose}
              id={"planner:0"}
            />
          </Box>
        </div>
      </DragDropContext>
    </div>
  );
};

export default Planner;

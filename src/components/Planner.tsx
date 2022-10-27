import {
  Button,
  Heading,
  Box,
  HStack,
  Collapse,
  useDisclosure,
  Text,
  Stack,
  Center,
  IconButton,
  Circle,
  Icon,
  Flex,
  Spacer,
} from "@chakra-ui/react";
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
import { useAppContext } from "./AppContext";
import { storeViewModel } from "../utils/plannerUtils";
import { motion } from "framer-motion";
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go";

interface PlannerProps {
  mainViewModel: MainViewModel;
}

// Notes about design:
//
// Container id naming scheme:
// For requirements: requirement:<array idx>
// For planner: planner:<array idx>
//
// State Tracking of Modules:
// The state of all modules displayed are tracked in `moduleMap`, where each module code is mapped to the module struct

const Planner = () => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const { mainViewModel, setMainViewModel } = useAppContext();

  const sortRequirementModules = (): void => {
    const modReqMap = new Map();
    for (let requirement of mainViewModel.requirements) {
      for (let mod of requirement.modules) {
        modReqMap.set(mod.code, mod);
      }
    }

    const addedSet = new Set();
    for (let i = 0; i < mainViewModel.requirements.length; i++) {
      mainViewModel.requirements[i].modules = [];
      for (let mod of mainViewModel.requirements[i].allModules) {
        if (modReqMap.has(mod.code)) {
          mainViewModel.requirements[i].modules.push(modReqMap.get(mod.code));
          addedSet.add(mod.code);
        }
      }
    }

    const extraModules = [...modReqMap.keys()].filter((x) => !addedSet.has(x));
    extraModules.forEach((modCode) =>
      mainViewModel.requirements.at(-1)?.modules.push(modReqMap.get(modCode)),
    );

    for (let requirement of mainViewModel.requirements) {
      requirement.modules = [...new Set(requirement.modules)].sort((a, b) =>
        a.code.localeCompare(b.code),
      );
    }

    forceUpdate();
    storeViewModel(mainViewModel);
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
        requirement.filtered((mod) => mod.id !== draggableId.split("|")[0]);
      }
    }

    if (!mainViewModel.moduleViewModelsMap.has(draggableId.split("|")[0]))
      return state;

    const modViewModel = mainViewModel.moduleViewModelsMap.get(
      draggableId.split("|")[0],
    );
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
    await applyPrereqValidation(state.planner).then((semesters) => {
      const isPrereqsViolated =
        semesters
          .map((semester) => semester.modules)
          .flat(1)
          .filter((module) => module.prereqsViolated?.length).length > 0;
      setIsValidateButtonDisabled(isPrereqsViolated);
      return isPrereqsViolated;
    });

    forceUpdate();
    sortRequirementModules();
  };

  const handleModuleClose = async (module: Module) => {
    console.log("handle module close", module.code);

    module.prereqsViolated = [];
    module.coreqsViolated = [];
    const state = mainViewModel;
    for (const semester of state.planner) {
      semester.filtered((mod) => mod.code !== module.code);
    }
    state.requirements[0].modules.push(module);
    await applyPrereqValidation(state.planner).then((semesters) => {
      const isPrereqsViolated =
        semesters
          .map((semester) => semester.modules)
          .flat(1)
          .filter((module) => module.prereqsViolated?.length).length > 0;
      setIsValidateButtonDisabled(isPrereqsViolated);
      return isPrereqsViolated;
    });

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

  const showRequirementToggleButton = mainViewModel.requirements.length > 1;

  const [isValidateButtonDisabled, setIsValidateButtonDisabled] =
    useState(false);

  const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure({
    defaultIsOpen: true,
  });
  const [hidden, setHidden] = useState(!isOpen);

  const studyPlanRow = (years: number[]) => (
    <HStack align="top">
      {years.map((year) => (
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
  );
  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <HStack align="">
          <motion.div
            {...getDisclosureProps()}
            hidden={hidden}
            initial={true}
            onAnimationStart={() => setHidden(false)}
            onAnimationComplete={() => setHidden(!isOpen)}
            animate={{ width: isOpen ? "100%" : 0 }}
            style={{
              overflow: "hidden",
              whiteSpace: "nowrap",
              left: "0",
              height: "100%",
              top: "0",
            }}
          >
            <Heading
              padding="1em 0em 1.5em"
              fontSize={"xl"}
              fontWeight={"bold"}
              fontFamily={"body"}
              paddingRight="1em"
            >
              Required Modules
            </Heading>
            <Box bgColor="blackAlpha.50">
              {mainViewModel.requirements.map((requirement, id) => (
                <RequirementContainer
                  requirement={requirement}
                  id={"requirement:" + id.toString()}
                  key={id}
                />
              ))}
            </Box>
          </motion.div>
          <HStack>
            <Button
              _hover={{ bg: "white" }}
              _active={{ bg: "white" }}
              backgroundColor={"white"}
              {...getButtonProps()}
            >
              <Circle
                size="30px"
                bg={"blackAlpha.900"}
                color="white"
                _hover={{ bg: "blackAlpha.700" }}
              >
                {isOpen ? (
                  <GoTriangleLeft></GoTriangleLeft>
                ) : (
                  <GoTriangleRight></GoTriangleRight>
                )}
              </Circle>
            </Button>
          </HStack>
          <Box minW="50%">
            <Flex align={"center"}>
              <Heading
                padding="1em 0em 1.5em"
                fontSize={"xl"}
                fontWeight={"bold"}
                fontFamily={"body"}
                paddingRight="1em"
              >
                Study Plan
              </Heading>
              <Spacer />
              <Button
                mr="1rem"
                size="sm"
                colorScheme={"white"}
                variant="outline"
                onClick={() => {
                  mainViewModel
                    .loadAcademicPlanFromURL()
                    .then(() => storeViewModel(mainViewModel))
                    .then(() => applyPrereqValidation(mainViewModel.planner))
                    .then(forceUpdate);
                }}
              >
                Populate Sample Study Plan
              </Button>
              <ValidateStudyPlanButton
                mainViewModel={mainViewModel}
                isDisabled={isValidateButtonDisabled}
              />
            </Flex>
            <Box className="horiscroll" borderColor="black">
              <Stack>
                {studyPlanRow(plannerYears.slice(0, 2))}
                {studyPlanRow(plannerYears.slice(2, 4))}
              </Stack>
              {/* <HStack align="top">
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
              </HStack> */}
            </Box>

            <div>
              <Heading
                fontSize={"xl"}
                fontWeight={"bold"}
                fontFamily={"body"}
                padding="1.4em 0em 0.5rem"
              >
                Exemptions
              </Heading>
              <Box borderColor="black" w="16rem">
                <ExemptionContainer
                  exemptedModules={mainViewModel.planner[0].modules}
                  handleModuleClose={handleModuleClose}
                  id={"planner:0"}
                />
              </Box>
            </div>
          </Box>
        </HStack>
      </DragDropContext>
    </div>
  );
};

export default Planner;

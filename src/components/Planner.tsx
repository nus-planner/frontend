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
  Alert,
  AlertIcon,
  Wrap,
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
import {
  loadPlannerSemesters,
  sortRequirementModules,
  storePlannerSemesters,
  storeViewModel,
} from "../utils/plannerUtils";
import { motion } from "framer-motion";
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go";
import APCContainer from "./APCContainer";
import { Resizable } from "re-resizable";
import { SP } from "next/dist/shared/lib/utils";

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

  // Assume standard max 4 years since no double degree
  const [plannerYears, setPlannerYears] = useState<number[]>([1, 2, 3, 4]);
  const [plannerSemesters, setPlannerSemesters] = useState<number[][]>([
    [1, 2],
    [1, 2],
    [1, 2],
    [1, 2],
  ]);

  useEffect(() => {
    setPlannerSemesters(loadPlannerSemesters());
  }, []);

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
      state.planner[destinationId].addModuleAtIndex(
        modViewModel,
        destinationIndex,
      );
    }

    await applyPrereqValidation(mainViewModel.startYear, state.planner).then(
      (semesters) => {
        const isPrereqsViolated =
          semesters
            .slice(2)
            .map((semester) => semester.modules)
            .flat(1)
            .filter((module) => module.prereqsViolated?.length).length > 0;
        setIsValidateButtonDisabled(isPrereqsViolated);
        return isPrereqsViolated;
      },
    );

    sortRequirementModules(mainViewModel);
    mainViewModel.validate();
    forceUpdate();
  };

  const handleModuleClose = async (module: Module) => {
    module.prereqsViolated = [];
    module.coreqsViolated = [];

    for (const semester of mainViewModel.planner) {
      semester.filtered((mod) => mod.id !== module.id);
    }
    mainViewModel.requirements[0].modules.push(module);

    await applyPrereqValidation(
      mainViewModel.startYear,
      mainViewModel.planner,
    ).then((semesters) => {
      const isPrereqsViolated =
        semesters
          .slice(2)
          .map((semester) => semester.modules)
          .flat(1)
          .filter((module) => module.prereqsViolated?.length).length > 0;
      setIsValidateButtonDisabled(isPrereqsViolated);
      return isPrereqsViolated;
    });

    sortRequirementModules(mainViewModel);
    mainViewModel.validate();
    forceUpdate();
  };

  const [isValidateButtonDisabled, setIsValidateButtonDisabled] =
    useState(false);

  const style = {
    overflow: "hidden clip",
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <HStack align="" spacing={"1rem"}>
          <Stack>
            <Resizable
              style={style}
              //size={{ width: "48vw", height: "82hv" }}
              minHeight="fit-content"
              maxWidth={"48vw"}
              defaultSize={{ width: "48vw", height: "82hv" }}
              handleStyles={{
                right: {
                  marginLeft: -20,
                  top: "50%",
                  left: "100%",
                  cursor: "ew-resize",
                  border: "5px solid #FED7D7",
                  borderTop: "none",
                  borderLeft: "none",
                  borderBottom: "none",
                  borderWidth: 10,
                  borderColor: "#FED7D7",
                  width: 15,
                  height: "4rem",
                  boxSizing: "border-box",
                  zIndex: 1,
                },
              }}
            >
              {/* <motion.div
            className="verscroll"
            {...getDisclosureProps()}
            hidden={hidden}
            initial={true}
            onAnimationStart={() => setHidden(false)}
            onAnimationComplete={() => setHidden(!isOpen)}
            animate={{ width: isOpen ? "100%" : 0 }}
            style={{
              overflowY: "auto",
              whiteSpace: "nowrap",
              left: "0",
              height: "90vh",
              top: "0",
            }}
          > */}
              <Heading
                padding="1em 0em 1em 1rem"
                fontSize={"xl"}
                fontWeight={"bold"}
                fontFamily={"body"}
                paddingRight="1em"
                overflow={"hidden"}
                minW="13rem"
              >
                Required Modules
              </Heading>
              {!mainViewModel.requirements.length && (
                <Alert status="warning" w="fit-content" whiteSpace={"initial"}>
                  <AlertIcon />
                  Please enter your enrollment year and major to load your
                  requirements
                </Alert>
              )}
              <Box bgColor="blackAlpha.50" overflowY="auto" maxH={"82vh"}>
                {mainViewModel.requirements.map((requirement, id) => (
                  <RequirementContainer
                    requirement={requirement}
                    id={"requirement:" + id.toString()}
                    key={id}
                  />
                ))}
              </Box>
            </Resizable>
          </Stack>
          {/* </motion.div> */}

          {/* <HStack>
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
                  <GoTriangleLeft />
                ) : (
                  <GoTriangleRight />
                )}
              </Circle>
            </Button>
          </HStack> */}
          <Box minW="50%">
            <HStack align={"center"} spacing="1rem">
              <Heading
                padding="1em 0em 1em"
                fontSize={"xl"}
                fontWeight={"bold"}
                fontFamily={"body"}
                paddingRight="1em"
              >
                Study Plan
              </Heading>
              <Button
                mr="1rem"
                size="sm"
                colorScheme={"white"}
                variant="outline"
                onClick={() => {
                  mainViewModel
                    .loadAcademicPlanFromURL()
                    .then(() => storeViewModel(mainViewModel))
                    .then(() =>
                      applyPrereqValidation(
                        mainViewModel.startYear,
                        mainViewModel.planner,
                      ),
                    )
                    .then(() => mainViewModel.validate())
                    .then(forceUpdate);
                }}
              >
                Populate Sample Study Plan
              </Button>
              <ValidateStudyPlanButton
                mainViewModel={mainViewModel}
                isDisabled={isValidateButtonDisabled}
              />
            </HStack>
            <Stack>
              <Wrap h="60vh" overflowY={"auto"}>
                {plannerYears.map((year) => (
                  <StudyPlanContainer
                    year={year}
                    semesters={plannerSemesters}
                    setSemesters={setPlannerSemesters}
                    plannerSemesters={mainViewModel.planner}
                    handleModuleClose={handleModuleClose}
                    id={year.toString()}
                    key={year}
                  />
                ))}
              </Wrap>
              <Flex h="20vh">
                <Box w="50%" padding="0 0.5rem 0 0">
                  <Heading
                    fontSize={"xl"}
                    fontWeight={"bold"}
                    fontFamily={"body"}
                    padding="0.5em 0em 0.4rem"
                  >
                    Exemptions
                  </Heading>
                  <Box borderColor="black">
                    <ExemptionContainer
                      exemptedModules={mainViewModel.exemptions.modules}
                      id={"planner:0"}
                      forceUpdate={forceUpdate}
                      setIsValidateButtonDisabled={setIsValidateButtonDisabled}
                    />
                  </Box>
                </Box>
                <Box w="50%" padding="0 0.5rem 0 0">
                  <Heading
                    fontSize={"xl"}
                    fontWeight={"bold"}
                    fontFamily={"body"}
                    padding="0.5em 0em 0.4rem"
                  >
                    APCs
                  </Heading>
                  <Box borderColor="black">
                    <APCContainer
                      exemptedModules={mainViewModel.apcs.modules}
                      id={"planner:1"}
                      forceUpdate={forceUpdate}
                      setIsValidateButtonDisabled={setIsValidateButtonDisabled}
                    />
                  </Box>
                </Box>
              </Flex>
            </Stack>
          </Box>
        </HStack>
      </DragDropContext>
    </div>
  );
};

export default Planner;

import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Stack,
  Wrap,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { Module } from "../../interfaces/planner";
import { applyPrereqValidation } from "../../utils/moduleUtils";
import {
  loadPlannerSemesters,
  sortRequirementModules,
  storeViewModel,
} from "../../utils/plannerUtils";
import { useAppContext } from "../AppContext";
import ExemptionContainer from "./ExemptionContainer";
import StudyPlanContainer from "./StudyPlanContainer";
import ValidateStudyPlanButton from "./ValidateStudyPlanButton";

interface ModulePlannerContainerProps {
  forceUpdate: () => void;
  isValidateButtonDisabled: boolean;
  setIsValidateButtonDisabled: (setIsDisabled: boolean) => void;
}

const ModulePlannerContainer = ({
  forceUpdate,
  isValidateButtonDisabled,
  setIsValidateButtonDisabled,
}: ModulePlannerContainerProps) => {
  const { mainViewModel } = useAppContext();

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

  return (
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
          <ExemptionContainer
            exemptedModules={mainViewModel.exemptions.modules}
            id={"planner:0"}
            forceUpdate={forceUpdate}
            setIsValidateButtonDisabled={setIsValidateButtonDisabled}
            exemptionType="exemption"
          />
          <ExemptionContainer
            exemptedModules={mainViewModel.apcs.modules}
            id={"planner:1"}
            forceUpdate={forceUpdate}
            setIsValidateButtonDisabled={setIsValidateButtonDisabled}
            exemptionType="apc"
          />
        </Flex>
      </Stack>
    </Box>
  );
};

export default ModulePlannerContainer;

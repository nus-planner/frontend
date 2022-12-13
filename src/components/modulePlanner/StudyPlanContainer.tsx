import {
  Spacer,
  Flex,
  Text,
  Box,
  HStack,
  Button,
  Tooltip,
} from "@chakra-ui/react";

import { Module, Semester } from "../../interfaces/planner";
import React, { useCallback, useState } from "react";
import SemesterPlanner from "./SemesterPlanner";
import { convertYearAndSemToIndex, storePlannerSemesters } from "../../utils/plannerUtils";

// Fix starting with 4 years (since we are not doing double degree for now)
// Ay is retrieved from the enrollment year from basic info
interface PlannerContainerProps {
  year: number;
  semesters: number[][];
  setSemesters: (semester: number[][]) => void;
  id: string;
  plannerSemesters: Semester[];
  handleModuleClose: (module: Module) => void;
}

const StudyPlanContainer = ({
  year,
  semesters,
  setSemesters,
  id,
  plannerSemesters,
  handleModuleClose,
}: PlannerContainerProps) => {
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const semIdx = year-1;


  const addSpecialTerm = () => {
    semesters[semIdx].push(semesters[semIdx].length + 1)
    setSemesters(semesters);
    storePlannerSemesters(semesters);
    forceUpdate();
  };

  const removeSpecialTerm = (year: number) => {
    semesters[semIdx].pop();
    semesters[semIdx].pop();
    setSemesters(semesters);
    storePlannerSemesters(semesters);

    for (let i = year*4 - 1; i <= year*4; i++) {
      for (let mod of plannerSemesters[i].modules) {
        handleModuleClose(mod)
      }
    }
    forceUpdate();
  };
  
const SpecialTermButton = (year: Number) => {
    if (semesters[semIdx].length === 4) {
      return (
        <Tooltip label="All modules in special terms will be cleared">
        <Button
          colorScheme="white"
          variant="outline"
          onClick={() => removeSpecialTerm(year.valueOf())}
          size="xs"
        >
          Clear Special Terms
        </Button>
        </Tooltip>
      );
    } else {
      return (
        <Button
          colorScheme="white"
          variant="outline"
          onClick={addSpecialTerm}
          size="xs"
        >
          + Special Term
        </Button>
      );
    }
  }

  return (
    <Box
      alignItems="baseline"
      bgColor="blackAlpha.50"
      borderRadius="0.3rem"
      minH="22em"
      padding={2}
    >
      <Flex pb={"0.3rem"} align="center">
          <Text fontSize={"sm"} fontWeight="bold" color={"blackAlpha.600"}>
            Year {year}
          </Text>
          <Spacer />
          {SpecialTermButton(year)}
        
      </Flex>
      <HStack scrollBehavior={"auto"} w="100%" align="">
        {semesters[semIdx].map((semester) => {
          const index = convertYearAndSemToIndex(Number(id), Number(semester));
          return (
            <SemesterPlanner
              semesterNumber={semester}
              id={"planner:" + index.toString()}
              semester={plannerSemesters[index]}
              semesterIdx={index}
              handleModuleClose={handleModuleClose}
              key={semester}
            ></SemesterPlanner>
          );
        })}
      </HStack>
    </Box>
  );
};

export default StudyPlanContainer;

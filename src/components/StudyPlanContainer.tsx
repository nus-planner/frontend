import {
  Spacer,
  Flex,
  IconButton,
  Text,
  Box,
  VStack,
  HStack,
  Button,
  Tooltip,
} from "@chakra-ui/react";

import DeleteIcon from "@chakra-ui/icons";

import { Module, Semester } from "../interfaces/planner";
import ModuleBox from "./ModuleBox";
import { Droppable } from "react-beautiful-dnd";
import React, { useCallback, useState } from "react";
import SemesterPlanner from "./SemesterPlanner";
import { convertYearAndSemToIndex } from "../utils/plannerUtils";

// Fix starting with 4 years (since we are not doing double degree for now)
// Ay is retrieved from the enrollment year from basic info
interface PlannerContainerProps {
  year: number;
  semesters: number[];
  id: string;
  plannerSemesters: Semester[];
  handleModuleClose: (module: Module) => void;
}

const StudyPlanContainer = ({
  year,
  semesters,
  id,
  plannerSemesters,
  handleModuleClose,
}: PlannerContainerProps) => {
  const [sems, setSems] = useState<number[]>(semesters);
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const addSpecialTerm = () => {
    semesters.push(sems.length + 1);
    setSems(semesters);
    forceUpdate();
  };

  const removeSpecialTerm = (year: number) => {
    semesters.pop();
    semesters.pop();
    setSems(semesters);
    for (let i = year*4 - 1; i <= year*4; i++) {
      for (let mod of plannerSemesters[i].modules) {
        handleModuleClose(mod)
      }
    }
    forceUpdate();
  };
  
const SpecialTermButton = (year: Number) => {
    if (sems.length === 4) {
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
        {sems.map((semester) => {
          // const index = 2 * (Number(id) - 1) + Number(semester);
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

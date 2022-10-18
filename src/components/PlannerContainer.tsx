import {
  Spacer,
  Flex,
  IconButton,
  Text,
  Box,
  VStack,
  HStack,
} from "@chakra-ui/react";

import DeleteIcon from "@chakra-ui/icons";

import { Module, Semester } from "../interfaces/planner";
import ModuleBox from "./ModuleBox";
import { Droppable } from "react-beautiful-dnd";
import React, { useState } from "react";
import SemesterPlanner from "./SemesterPlanner";

// Fix starting with 4 years (since we are not doing double degree for now)
// Ay is retrieved from the enrollment year from basic info
interface PlannerContainerProps {
  year: number;
  semesters: number[];
  id: string;
  handleModuleClose: (module: Module) => void;
}

const PlannerContainer = ({
  year,
  semesters,
  id,
  handleModuleClose,
}: PlannerContainerProps) => {
  const [semester, setSemeter] = useState([]);

  return (
    <Box
      alignItems="baseline"
      bgColor="blackAlpha.200"
      borderRadius="0.3rem"
      minH="22em"
      minW="28em"
      padding={3}
    >
      <Flex>
        <Box>
          <Text fontSize={"xs"} fontWeight="bold" color={"blackAlpha.600"}>
            Year {year}
          </Text>
        </Box>
        <Spacer />
        <Box>
          <Text fontSize={"xs"} fontWeight="bold" color={"blackAlpha.600"}>
            MCs
          </Text>
        </Box>
      </Flex>
      <HStack scrollBehavior={"auto"} w="100%">
        {semesters.map((semester) => (
          <SemesterPlanner
            sem={semester}
            id={"planner:" + (2*(Number(id)-1)+Number(semester)).toString()}
            handleModuleClose={handleModuleClose}
            key={semester}
          ></SemesterPlanner>
        ))}
      </HStack>
    </Box>
  );
};

export default PlannerContainer;

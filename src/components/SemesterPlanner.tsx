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

interface SemesterPlannerProps {
  semesterNumber: number;
  id: string;
  semester: Semester;
  semesterIdx: number;
  handleModuleClose: (module: Module) => void;
}

const SemesterPlanner = ({
  semesterNumber,
  id,
  semester,
  semesterIdx,
  handleModuleClose,
}: SemesterPlannerProps) => {

  return (
    <Box>
      <Text fontSize={"xs"} fontWeight="bold" color={"blackAlpha.900"} pb={1}>
        Semester {semesterNumber}
      </Text>
      <Box border="dotted" borderColor={"blackAlpha.400"} minW="13rem">
        <Droppable droppableId={id}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <VStack minW="12rem" minH="18em">
                {semester.modules.map((module: Module, idx) => (
                  <ModuleBox
                    module={module}
                    key={module.code + idx.toString()}
                    displayModuleClose={true}
                    parentStr={semesterIdx.toString()}
                    handleModuleClose={handleModuleClose}
                    idx={idx}
                  />
                ))}
              </VStack>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Box>
    </Box>
  );
};

export default SemesterPlanner;

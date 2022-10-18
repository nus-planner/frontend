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
  sem: number;
  id: string;
  handleModuleClose: (module: Module) => void;
}

const SemesterPlanner = ({
  sem,
  id,
  handleModuleClose,
}: SemesterPlannerProps) => {
  const [semester, setSemeter] = useState([]);
  console.log(id);

  return (
    <Box>
      <Text fontSize={"xs"} fontWeight="bold" color={"blackAlpha.900"} pb={1}>
        Semester {sem}
      </Text>
      <Box border="dotted" borderColor={"blackAlpha.400"} minW="13rem">
        <Droppable droppableId={id}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <VStack minW="12rem" minH="18em">
                {semester.map((module: Module, idx) => (
                  <ModuleBox
                    module={module}
                    key={module.code}
                    displayModuleClose={true}
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

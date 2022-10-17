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

// Fix starting with 4 years (since we are not doing double degree for now)
// Ay is retrieved from the enrollment year from basic info
interface PlannerContainerProps {
  year: number;
  id: string;
  handleModuleClose: (module: Module) => void;
}

const PlannerContainer = ({
  year,
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
      minW="26em"
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
        <Box>
          <Text fontSize={"xs"} fontWeight="bold" color={"blackAlpha.900"} pb={1}>
            Semester 1
          </Text>
          <Box border="dotted" borderColor={"blackAlpha.400"}>
            <Droppable droppableId={id}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <VStack minW="12rem" minH="18em">
                    {semester.map((module, idx) => (
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
        <Box>
          <Text fontSize={"xs"} fontWeight="bold" color={"blackAlpha.900"}  pb={1}>
            Semester 2
          </Text>
          <Box border="dotted" borderColor={"blackAlpha.400"}>
            <Droppable droppableId={id}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <VStack minW="12rem" minH="18em">
                    {semester.map((module, idx) => (
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
      </HStack>
    </Box>
  );
};

export default PlannerContainer;

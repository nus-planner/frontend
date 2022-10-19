import { IconButton, Text, Box, VStack, Flex, Spacer } from "@chakra-ui/react";

import { Module, Semester } from "../interfaces/planner";
import ModuleBox from "./ModuleBox";
import { Droppable } from "react-beautiful-dnd";

interface ExemptionContainerProps {
  exemptedModules: Module[];
  id: string;
  handleModuleClose: (module: Module) => void;
}

const ExemptionContainer = ({
  exemptedModules,
  id,
  handleModuleClose,
}: ExemptionContainerProps) => {
  return (
    <Box
      alignItems="baseline"
      bgColor="purple.50"
      borderRadius="0.4rem"
      minH="22em"
    >
      <Flex>
        <Box>
          <Text fontSize={"xs"} fontWeight="bold" color={"blackAlpha.600"}>
            Exemptions
          </Text>
        </Box>
        <Spacer />
      </Flex>
      <Droppable droppableId={id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <VStack minW="12rem" minH="18em">
              {exemptedModules.map((module, idx) => (
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
  );
};

export default ExemptionContainer;

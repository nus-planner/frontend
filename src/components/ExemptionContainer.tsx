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
      bgColor="blackAlpha.50"
      borderRadius="0.4rem"
      minH="22sem"
    >
      
      {/* <Droppable droppableId={id}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <VStack minW="12rem" minH="18em" padding="0.5rem 0rem">
              {exemptedModules.map((module, idx) => (
                <ModuleBox
                  module={module}
                  key={idx}
                  displayModuleClose={true}
                  handleModuleClose={handleModuleClose}
                  parentStr={'exemption'}
                  idx={idx}
                />
              ))}
            </VStack>
            {provided.placeholder}
          </div>
        )}
      </Droppable> */}

      
    </Box>
  );
};

export default ExemptionContainer;

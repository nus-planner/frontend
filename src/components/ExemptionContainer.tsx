import { IconButton, Text, Box, VStack } from "@chakra-ui/react";

import { Module, Semester } from "../interfaces/planner";
import ModuleBox from "./ModuleBox";
import { Droppable } from "react-beautiful-dnd";

interface ExemptionContainerProps {
  semester?: Semester;
  id?: string;
  handleModuleClose: (module: Module) => void;
}

const ExemptionContainer = ({
  semester,
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
      <VStack>
        <Droppable droppableId={id}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <VStack minW="12rem" minH="18em">
                {semester.modules.map((module, idx) => (
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
      </VStack>
    </Box>
  );
};

export default ExemptionContainer;

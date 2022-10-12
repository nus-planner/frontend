import { IconButton, Text, Box, VStack } from "@chakra-ui/react";

import DeleteIcon from "@chakra-ui/icons";

import { Module, Semester } from "../interfaces/planner";
import ModuleBox from "./ModuleBox";
import { Droppable } from "react-beautiful-dnd";

interface PlannerContainerProps {
  semester: Semester;
  id: string;
  handleModuleClose: (module: Module) => void;
}

const PlannerContainer = ({
  semester,
  id,
  handleModuleClose,
}: PlannerContainerProps) => {
  return (
    // <Droppable droppableId={id}>
    //   {(provided) => (
    //     <div {...provided.droppableProps} ref={provided.innerRef}>
    <Box
      alignItems="baseline"
      bgColor="purple.50"
      borderRadius="0.5rem"
      minH="22em"
      minW="13em"
    >
      <VStack>
        <Text padding="2" fontSize={"sm"} fontWeight="bold" color={"black.900"}>
          Year {semester.year} Sem {semester.semester}
        </Text>
        <Droppable droppableId={id}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <VStack minW='12rem' minH='18em'>
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
    //       {provided.placeholder}
    //     </div>
    //   )}
    // </Droppable>
  );
};

export default PlannerContainer;

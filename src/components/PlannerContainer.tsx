import { Text, Box, VStack } from "@chakra-ui/react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Module } from "../interfaces/planner";
import ModuleBox from "./ModuleBox";

interface PlannerContainerProps {
  semester: Module[];
  id: string;
  handleModuleClose: (module: Module) => void;
}

const PlannerContainer = ({
  semester,
  id,
  handleModuleClose,
}: PlannerContainerProps) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef}>
      <Box
        alignItems='baseline'
        bgColor="purple.50"
        borderRadius="0.5rem"
        minH="22em"
        minW="13em"
      >
        <SortableContext
          items={semester.modules.map((mod) => mod.code)}
          id={id}
          strategy={verticalListSortingStrategy}
        >
          <VStack>
            <Text padding='2' fontSize={'sm'} fontWeight='bold' color={'black.900'}>Year {semester.year} Sem {semester.semester}</Text>
            {semester.modules.map((module) => (
              <ModuleBox
                module={module}
                key={module.code}
                displayModuleClose={true}
                handleModuleClose={handleModuleClose}
              />
            ))}
          </VStack>
        </SortableContext>
      </Box>
    </div>
  );
};

export default PlannerContainer;

import { Box, VStack } from "@chakra-ui/react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Module } from "../interfaces/planner";
import ModuleBox from "./ModuleBox";

const PlannerContainer = ({
  semester,
  id,
}: {
  semester: Module[];
  id: string;
}) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef}>
      <Box
        m="2"
        padding="1.5rem"
        alignItems="center"
        bgColor="gray.200"
        borderRadius="0.5rem"
        minH="22em"
        minW="20em"
      >
        <SortableContext
          items={semester.map((mod) => mod.code)}
          id={id}
          strategy={verticalListSortingStrategy}
        >
          <VStack>
            {semester.map((module) => (
              <ModuleBox module={module} key={module.code} />
            ))}
          </VStack>
        </SortableContext>
      </Box>
    </div>
  );
};

export default PlannerContainer;

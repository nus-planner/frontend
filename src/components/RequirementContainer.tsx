import { Box, Grid, HStack, SimpleGrid, VStack } from "@chakra-ui/react";
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import ModuleBox from "./ModuleBox";
import { Requirement } from "../interfaces/planner";
import { useDroppable } from "@dnd-kit/core";

const RequirementContainer = ({
  requirement,
  id,
}: {
  requirement: Requirement;
  id: string;
}) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <HStack ref={setNodeRef}>
      <Box
        m="2"
        padding="3"
        alignItems="left"
        color="black"
        minH="10em"
        minW="60em"
      >
        <SortableContext
          items={requirement.modules.map((mod) => mod.code)}
          id={id}
          strategy={verticalListSortingStrategy}
        >
          <HStack
            boxShadow="outline"
            minH="10em"
            minW="20em"
          >
            {requirement.modules.map((module) => (
              <ModuleBox
                module={module}
                key={module.code}
                displayModuleClose={false}
              />
            ))}
          </HStack>
        </SortableContext>
      </Box>
    </HStack>
  );
};

export default RequirementContainer;

import { Box, HStack } from "@chakra-ui/react";
import {
  SortableContext,
  horizontalListSortingStrategy,
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
    <div ref={setNodeRef}>
      <Box
        m="2"
        padding="3"
        alignItems="left"
        color="black"
        minH="5em"
        minW="20em"
      >
        <SortableContext
          items={requirement.modules.map((mod) => mod.code)}
          id={id}
          strategy={horizontalListSortingStrategy}
        >
          <HStack>
            {requirement.modules.map((module) => (
              <div key={module.code}>
                <ModuleBox module={module} />
              </div>
            ))}
          </HStack>
        </SortableContext>
      </Box>
    </div>
  );
};

export default RequirementContainer;

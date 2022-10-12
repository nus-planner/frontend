import {
  Flex,
  Container,
  Stack,
  Heading,
  Text,
  Box,
  Grid,
  HStack,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import {
  SortableContext,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import ModuleBox from "./OldModuleBox";
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
    <HStack ref={setNodeRef} h="95px" backgroundColor={"purple.50"}>
      <Flex align="flex-start">
        <Stack spacing={0} mb={5} w="250px">
          <Heading fontSize={"medium"} fontWeight={500} fontFamily={"body"}>
            {requirement.title}
          </Heading>
          <Text pt={"2"} fontSize={"x-small"} color={"gray.500"}>
            {requirement.description}
          </Text>
        </Stack>
      </Flex>
      <div className="horiscroll">
        <Box
          alignContent={"baseline"}
          alignItems="left"
          color="black"
          scrollBehavior={"auto"}
        >
          <SortableContext
            items={requirement.modules.map((mod) => mod.code)}
            id={id}
          >
            <HStack minH="5em" minW="20em">
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
      </div>
    </HStack>
  );
};

export default RequirementContainer;

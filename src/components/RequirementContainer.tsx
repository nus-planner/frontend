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
import { Droppable } from "react-beautiful-dnd";
import ModuleBox from "./ModuleBox";
import { Requirement } from "../interfaces/planner";

const RequirementContainer = ({
  requirement,
  id,
}: {
  requirement: Requirement;
  id: string;
}) => {
  return (
    <Droppable droppableId={id} direction='horizontal'>
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef}>
          <HStack h="95px" backgroundColor={"purple.50"}>
            <Flex align="flex-start">
              <Stack spacing={0} mb={5} w="250px">
                <Heading
                  fontSize={"medium"}
                  fontWeight={500}
                  fontFamily={"body"}
                >
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
                <HStack minH="5em" minW="20em">
                  {requirement.modules.map((module, idx) => (
                    <ModuleBox
                      module={module}
                      key={module.code}
                      displayModuleClose={false}
                      idx={idx}
                    />
                  ))}
                </HStack>
              </Box>
            </div>
          </HStack>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default RequirementContainer;

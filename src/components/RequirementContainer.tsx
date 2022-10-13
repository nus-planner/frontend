import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Flex,
  Container,
  Stack,
  Heading,
  Text,
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
    <Accordion allowToggle>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              {requirement.title}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4} borderRadius='0'>
          <HStack h="95px" backgroundColor={"purple.50"}>
            <Text pt={"2"} fontSize={"x-small"} color={"gray.500"} w="15rem">
              {requirement.description}
            </Text>
            <Box
              alignContent={"baseline"}
              alignItems="left"
              color="black"
              scrollBehavior={"auto"}
            >
              <Droppable droppableId={id} direction="horizontal">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <HStack>
                      {requirement.modules.map((module, idx) => (
                        <ModuleBox
                          module={module}
                          key={module.code}
                          displayModuleClose={false}
                          idx={idx}
                        />
                      ))}
                    </HStack>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Box>
          </HStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default RequirementContainer;

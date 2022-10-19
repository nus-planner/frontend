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
  // If there is no requirement description, module lists align to leftmost, else, fix width.
  const requirementWith = requirement.description ? "12rem" : "";

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            {requirement.title}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={2}>
          <HStack h="-webkit-fit-content">
            {requirement.description && (
              <Text
                fontSize={"x-small"}
                color={"blackAlpha.700"}
                minW={requirementWith}
                w={requirementWith}
              >
                {requirement.description}
              </Text>
            )}
            <Droppable droppableId={id} direction="horizontal">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <HStack>
                    {requirement.modules.map((module, idx) => (
                      <ModuleBox
                        module={module}
                        key={module.code + idx.toString()}
                        displayModuleClose={false}
                        idx={idx}
                        parentStr={requirement.title}
                      />
                    ))}
                  </HStack>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </HStack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default RequirementContainer;

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
  Button,
} from "@chakra-ui/react";
import { Droppable } from "react-beautiful-dnd";
import ModuleBox from "./ModuleBox";
import { Requirement, Module } from "../interfaces/planner";
import React from "react";
import { DEFAULT_MODULE_COLOR } from "../constants/moduleColor";

const RequirementContainer = ({
  requirement,
  id,
}: {
  requirement: Requirement;
  id: string;
}) => {
  // If there is no requirement description, module lists align to leftmost, else, fix width.
  const requirementWith = requirement.description ? "12rem" : "";
  const [newUEs, setNewUEs] = React.useState<Module[]>([]);
  const [newUEsStack, setNewUEsStack] = React.useState(<HStack></HStack>);
  const addUE = () => {
    // TODO: make it non-hardcoded
    newUEs.push({
      code: ".",
      name: "Select A Basket",
      credits: null,
      color: "pink.100",
    });
    setNewUEs(newUEs);
    setNewUEsStack(
      <HStack>
        {newUEs.map((module, idx) => (
          <ModuleBox
            module={module}
            key={module.code + idx.toString()}
            displayModuleClose={false}
            idx={idx}
            parentStr={requirement.title}
          />
        ))}
      </HStack>,
    );
  };

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
                <div
                  className="horiscroll"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
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
                    {newUEsStack}
                    <Button
                      minW="12rem"
                      minH="5rem"
                      colorScheme={"white"}
                      variant={"outline"}
                      alignContent="center"
                      borderRadius="0.4rem"
                      padding="0.2rem 0.5rem"
                      onClick={addUE}
                    >
                      + Add an UE
                    </Button>
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

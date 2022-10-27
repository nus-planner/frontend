import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Wrap,
  background,
  HStack,
  Badge,
  Tag,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import ModuleBox from "./ModuleBox";
import { Module, Requirement } from "../interfaces/planner";
import React from "react";
import { MultiModuleViewModel, RequirementViewModel } from "../models";
import { useAppContext } from "./AppContext";
import { moduleColor } from "../constants/moduleColor";
import { SearchIcon } from "@chakra-ui/icons";

const RequirementContainer = ({
  requirement,
  id,
}: {
  requirement: RequirementViewModel;
  id: string;
}) => {
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  // If there is no requirement description, module lists align to leftmost, else, fix width.
  const requirementWith = requirement.description ? "12rem" : "";
  const [ueCount, setUeCount] = useState<number>(0);
  const { mainViewModel, setMainViewModel } = useAppContext();
  const [displayedModulesFilter, setDisplayedModulesFilter] = useState("");

  const respawnButtons = requirement.respawnables
    .uniqueByKey("name")
    .map((respawnable) => {
      console.log(respawnable);
      console.log(respawnable.name);
      return (
        <Button
          key={respawnable.code}
          minW="12rem"
          minH="5rem"
          colorScheme={"white"}
          variant={"outline"}
          alignContent="center"
          borderRadius="0.4rem"
          padding="0.2rem 0.5rem"
          onClick={() => {
            const newViewModel = new MultiModuleViewModel(
              respawnable.code,
              respawnable.name,
              -1,
            );

            newViewModel.color =
              moduleColor[parseInt(id.split(":")[1]) % moduleColor.length];

            requirement.modules.push(newViewModel);
            mainViewModel.addModuleViewModelToGlobalState(newViewModel);

            setUeCount((count) => count + 1);
            forceUpdate();
          }}
        >
          + Add {respawnable.name}
        </Button>
      );
    });

  const moduleFilter = (mod: Module): boolean => {
    if (mod.code.toLowerCase().includes(displayedModulesFilter.toLowerCase()))
      return true;
    if (mod.name.toLowerCase().includes(displayedModulesFilter.toLowerCase()))
      return true;
    if (mod.getUnderlyingModule) {
      const underlyingModule = mod.getUnderlyingModule();
      if (underlyingModule !== undefined) {
        // underlying module is of different type
        if (
          underlyingModule.code
            .toLowerCase()
            .includes(displayedModulesFilter.toLowerCase())
        )
          return true;
        if (
          underlyingModule.name
            .toLowerCase()
            .includes(displayedModulesFilter.toLowerCase())
        )
          return true;
      }
    }

    return false;
  };

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <HStack>
              <Text>{requirement.title}</Text>
              {requirement.expectedMcs !== undefined && (
                <Tag
                  colorScheme={
                    requirement.matchedMCs >= (requirement.expectedMcs || 0)
                      ? "green"
                      : "red"
                  }
                  size='sm'
                >
                  {requirement.matchedMCs} / {requirement.expectedMcs || 0} MCs
                  Fulfilled
                </Tag>
              )}
            </HStack>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={2}>
          <InputGroup padding="0 0 0.5rem">
            <InputLeftElement zIndex="0">
              <SearchIcon />
            </InputLeftElement>
            <Input
              width="12rem"
              borderColor="blackAlpha.700"
              focusBorderColor="blackAlpha.700"
              _hover={{ borderColor: "blackAlpha.700" }}
              borderWidth={1}
            />
          </InputGroup>
          <Box>
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
            <Droppable droppableId={id} direction="horizontal" isDropDisabled>
              {(provided) => (
                <div
                  className="horiscroll"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <Wrap overflowY="auto" maxH={"22rem"} spacing="0.5rem">
                    {requirement.modules
                      .filter(moduleFilter)
                      .map((module, idx) => (
                        <ModuleBox
                          module={module}
                          key={module.code + idx.toString()}
                          displayModuleClose={false}
                          idx={idx}
                          parentStr={requirement.title}
                        />
                      ))}
                    {respawnButtons}
                  </Wrap>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default RequirementContainer;

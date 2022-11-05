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
  Spacer,
  Divider,
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
      return (
        <Button
          key={respawnable.code}
          w="12rem"
          minH="5rem"
          colorScheme={"white"}
          variant={"outline"}
          alignContent="center"
          borderRadius="0.4rem"
          padding="0.2rem 0.5rem"
          whiteSpace={"initial"}
          fontSize="sm"
          onClick={() => {
            const newViewModel = new MultiModuleViewModel(
              respawnable.code,
              respawnable.name,
              -1,
            );

            newViewModel.color = [
              moduleColor[parseInt(id.split(":")[1]) % moduleColor.length],
            ];

            requirement.modules.push(newViewModel);
            mainViewModel.addModuleViewModelToGlobalState(newViewModel);

            setUeCount((count) => count + 1);
            forceUpdate();
          }}
        >
          <Text fontSize={"xl"} colorScheme={"white"}>
            {" "}
            +{" "}
          </Text>
          &nbsp;{respawnable.name}
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

    // Always display multimodule if dropdown module is not yet selected
    if (
      !!mod.isMultiModule &&
      !!mod.getUnderlyingModule &&
      !mod.getUnderlyingModule()
    ) {
      return true;
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
                  colorScheme={requirement.isFulfilled ? "green" : "red"}
                  size="sm"
                >
                  {requirement.matchedMCs} / {requirement.expectedMcs || 0} MCs
                  Fulfilled
                  {!requirement.isFulfilled &&
                    requirement.matchedMCs >= requirement.expectedMcs && (
                      <span>, Underlying Requirements Unfulfilled</span>
                    )}
                </Tag>
              )}
            </HStack>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={2} whiteSpace="initial">
          <InputGroup padding="0 0 0.5rem" size="sm">
            <InputLeftElement zIndex="0">
              <SearchIcon />
            </InputLeftElement>
            <Input
              width="12rem"
              borderRadius={"0.4rem"}
              borderColor="blackAlpha.700"
              focusBorderColor="blackAlpha.700"
              _hover={{ borderColor: "blackAlpha.700" }}
              borderWidth={1}
              onChange={(e) => setDisplayedModulesFilter(e.target.value)}
            />
          </InputGroup>
          <Box overflow={"visible"}>
            {requirement.description && (
              <>
                <Text
                  fontSize={"xs"}
                  color={"blackAlpha.700"}
                  whiteSpace="pre-wrap"
                >
                  {requirement.description}
                </Text>
                <Divider flexDirection={"row"} margin="0.5rem 0rem" />
              </>
            )}
            <Droppable droppableId={id} direction="horizontal" isDropDisabled>
              {(provided) => (
                <div
                  className="horiscroll"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <Wrap spacing="0.5rem" pt="0.25rem">
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

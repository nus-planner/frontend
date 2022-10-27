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
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import ModuleBox from "./ModuleBox";
import { Module, Requirement } from "../interfaces/planner";
import React from "react";
import { MultiModuleViewModel } from "../models";
import { useAppContext } from "./AppContext";
import { moduleColor } from "../constants/moduleColor";
import { SearchIcon } from "@chakra-ui/icons";

const RequirementContainer = ({
  requirement,
  id,
}: {
  requirement: Requirement;
  id: string;
}) => {
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  // If there is no requirement description, module lists align to leftmost, else, fix width.
  const requirementWith = requirement.description ? "12rem" : "";
  const [ueCount, setUeCount] = useState<number>(0);
  const { mainViewModel, setMainViewModel } = useAppContext();
  const [displayedModulesFilter, setDisplayedModulesFilter] = useState("");

  const addUE = () => {
    const newUE = new MultiModuleViewModel(
      "." + ueCount.toString(),
      "Select A Basket",
      0,
    );

    newUE.color = moduleColor[parseInt(id.split(":")[1]) % moduleColor.length];

    mainViewModel.requirements.at(-1)?.modules.push(newUE);
    mainViewModel.addModuleViewModelToGlobalState(newUE);

    setUeCount((count) => count + 1);
    forceUpdate();
  };

  const isUERequirementContainer = () => {
    return (
      requirement.title === "Unrestricted Electives" ||
      requirement.title.toLowerCase() === "ue"
    );
  };

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
            <Text>{requirement.title}</Text>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={2}>
          <InputGroup padding="0 0 0.5rem">
            <InputLeftElement zIndex="0">
              <SearchIcon />
            </InputLeftElement>
            <Input
              width="10rem"
              borderColor="gray.500"
              onChange={(e) => setDisplayedModulesFilter(e.target.value)}
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
                  <Wrap>
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
                    {isUERequirementContainer() && (
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
                    )}
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

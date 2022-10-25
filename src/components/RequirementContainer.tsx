import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  HStack,
  Button,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import ModuleBox from "./ModuleBox";
import { Requirement } from "../interfaces/planner";
import React from "react";
import { MultiModuleViewModel } from "../models";
import { useAppContext } from "./AppContext";
import { moduleColor } from "../constants/moduleColor";

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
          <Box h="7.73216em">
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
                  <HStack align="">
                    {requirement.modules.map((module, idx) => (
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
                  </HStack>
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

import {
  Box,
  Container,
  Grid,
  GridItem,
  HStack,
  StackDivider,
  VStack,
} from "@chakra-ui/react";
import { DndContext, closestCorners, useDroppable } from "@dnd-kit/core";
import ModuleBox from "../components/ModuleBox";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { Module, Requirement, ModulesState } from "../interfaces/planner";
import { insertAtIndex, removeAtIndex } from "../utils/dndUtils";
import RequirementContainer from "../components/RequirementContainer";
import PlannerContainer from "../components/PlannerContainer";

interface Container {
  id: string;
  containerType: "requirement" | "planner" | "";
}

const dummyModuleState: ModulesState = {
  requirements: [
    {
      title: "Core Modules",
      description: "Core module description",
      modules: [
        { code: "CS3243", name: "Programming Methodology", credits: 4 },
        { code: "CS3244", name: "Discrete Structures", credits: 4 },
      ],
    },
    {
      title: "Elective Modules",
      description: "Elective module description",
      modules: [
        { code: "CS3216", name: "Bad Module", credits: 4 },
        { code: "CS3217", name: "Ok Module", credits: 4 },
      ],
    },
  ],
  planner: [
    [
      { code: "CS1101S", name: "Programming Methodology", credits: 4 },
      { code: "CS1231S", name: "Discrete Structures", credits: 4 },
    ],
    [
      { code: "CS2030S", name: "Programming Methodology II", credits: 4 },
      { code: "CS2040S", name: "Data Structures and Algorithms", credits: 4 },
    ],
  ],

  startYear: "",
};

// Container id naming scheme:
// For requirements: Container id = requirements.title
// For planner: Container id = planner array idx (0,1,2,...)
// Concern: Do we care about special term?
// TODO: Optimise this maybe, this is slow

const RyanTestPage = () => {
  // OLD, for reference only
  const getContainer = (moduleCode: string): Container => {
    // Check requirements for module code
    for (var requirement of modulesState.requirements) {
      for (var module of requirement.modules) {
        if (module.code === moduleCode) {
          return { id: requirement.title, containerType: "requirement" };
        }
      }
    }
    // Check planner for module code
    for (var i = 0; i < modulesState.planner.length; i++) {
      for (var module of modulesState.planner[i]) {
        if (module.code === moduleCode) {
          return { id: i.toString(), containerType: "planner" };
        }
      }
    }
    return null;
  };

  const getRequirementIndex = (requirementTitle: string): number => {
    for (var i = 0; i < modulesState.requirements.length; i++) {
      console.log(modulesState.requirements[i].title, requirementTitle);
      if (modulesState.requirements[i].title === requirementTitle) {
        console.log(i);
        return i;
      }
    }
    return -1;
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    console.log(`handle drag over, active: ${active.id}, over: ${over.id}`);

    if (!over || !over.id) {
      setActiveId(null);
      return;
    }

    // if (!over.id) {
    //   return;
    // }

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;

    if (activeContainer !== overContainer) {
      setModulesState((state) => {
        const activeIndex = active.data.current.sortable.index;
        const overIndex = over.id.includes(":")
          ? 1
          : over.data.current.sortable.index;

        return moveBetweenContainers(
          activeContainer,
          overContainer,
          activeIndex,
          overIndex,
          state
        );
      });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    console.log(`handleDragEnd, active: ${active.id}, over: ${over.id}`);

    // if (!over.id) {
    //   return;
    // }

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;

    // if (!activeContainer || !overContainer) {
    //   return;
    // }

    const activeIndex = active.data.current.sortable.index;
    console.log(`test ${over.id}`);
    const overIndex = over.id.includes(":")
      ? 1
      : over.data.current.sortable.index;

    if (active.id !== over.id) {
      setModulesState((state) => {
        if (activeContainer == overContainer) {
          console.log(activeContainer);
          console.log(overContainer);
          const containerId: string[] = overContainer.split(":");
          const containerType = containerId[0];
          // TODO: Find a more elegant way of doing this
          if (containerType === "planner") {
            var newState: ModulesState = { ...state };
            const semIdx = parseInt(containerId[1]);
            console.log("newState");
            console.log(newState);
            console.log(newState.planner[semIdx]);

            newState.planner[semIdx] = arrayMove(
              newState.planner[semIdx],
              activeIndex,
              overIndex
            );

            return newState;
          } else if (containerType === "requirement") {
            var newState: ModulesState = { ...state };
            const requirementIndex = getRequirementIndex(containerId[1]);
            console.log(requirementIndex);
            console.log(newState.requirements[requirementIndex]);

            newState.requirements[requirementIndex].modules = arrayMove(
              newState.requirements[requirementIndex].modules,
              activeIndex,
              overIndex
            );
            return newState;
          }
        } else {
          return moveBetweenContainers(
            activeContainer,
            overContainer,
            activeIndex,
            overIndex,
            state
          );
        }
      });
    }
  };

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragCancel = () => setActiveId(null);

  const moveBetweenContainers = (
    activeContainer,
    overContainer,
    activeIndex,
    overIndex,
    state
  ) => {
    const activeContainerId: string[] = activeContainer.split(":");
    const overContainerId: string[] = overContainer.split(":");
    const activeContainerType = activeContainerId[0];
    const overContainerType = overContainerId[0];
    var newState = { ...state };

    var item: Module = null;

    if (activeContainerType == "planner") {
      var semIdx = parseInt(activeContainerId[1]);
      item = newState.planner[semIdx][activeIndex];
      newState.planner[semIdx] = removeAtIndex(
        newState.planner[semIdx],
        activeIndex
      );
    }
    if (activeContainerType == "requirement") {
      var reqIdx = getRequirementIndex(activeContainerId[1]);
      console.log(reqIdx);
      console.log(newState.requirements);
      item = newState.requirements[reqIdx].modules[activeIndex];
      newState.requirements[reqIdx].modules = removeAtIndex(
        newState.requirements[reqIdx].modules,
        activeIndex
      );
      console.log(newState.requirements);
    }

    console.log("item to move between containers");
    console.log(item);

    if (overContainerType == "planner") {
      var semIdx = parseInt(overContainerId[1]);
      newState.planner[semIdx] = insertAtIndex(
        newState.planner[semIdx],
        overIndex,
        item
      );
    }

    if (overContainerType == "requirement") {
      var reqIdx = getRequirementIndex(overContainerId[1]);
      newState.requirements[reqIdx].modules = insertAtIndex(
        newState.requirements[reqIdx].modules,
        overIndex,
        item
      );
    }
    console.log(newState);
    return newState;
  };

  const [activeId, setActiveId] = useState(null);

  const [modulesState, setModulesState] =
    useState<ModulesState>(dummyModuleState);

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
    >
      <a>Testing random junk</a>
      <div />
      <Box
        bgColor="gray.200"
        margin="1em 1em 4em"
        borderColor="black"
        padding="0.5em"
        borderRadius="0.5em"
      >
        <VStack align="left" divider={<StackDivider borderColor="gray.400" />}>
          {modulesState.requirements.map((requirement, id) => (
            <RequirementContainer
              requirement={requirement}
              id={"requirement:" + requirement.title}
            />
          ))}
        </VStack>
      </Box>
      <Box margin="1em 1em 4em" borderColor="black" padding="0.5em">
        <HStack align="top" divider={<StackDivider borderColor="gray.400" />}>
          {modulesState.planner.map((semester, id) => (
            <PlannerContainer
              semester={semester}
              id={"planner:" + id.toString()}
            />
          ))}
        </HStack>
      </Box>
    </DndContext>
  );
};

export default RyanTestPage;

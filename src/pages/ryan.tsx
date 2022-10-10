import {
  Heading,
  Text,
  Box,
  Container,
  Grid,
  GridItem,
  HStack,
  SimpleGrid,
  StackDivider,
  VStack,
} from "@chakra-ui/react";
import {
  DndContext,
  closestCorners,
  useDroppable,
  closestCenter,
  useSensor,
  PointerSensor,
  useSensors,
} from "@dnd-kit/core";
import ModuleBox from "../components/ModuleBox";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { Module, Requirement, ModulesState } from "../interfaces/planner";
import { insertAtIndex, removeAtIndex } from "../utils/dndUtils";
import RequirementContainer from "../components/RequirementContainer";
import PlannerContainer from "../components/PlannerContainer";
import {
  dummyModuleState,
  sampleModuleRequirements,
} from "../constants/dummyModuleData";

interface Container {
  id: string;
  containerType: "requirement" | "planner" | "";
}

// Container id naming scheme:
// For requirements: Container id = requirements.title
// For planner: Container id = planner array idx (0,1,2,...)
// Concern: Do we care about special term?

const RyanTestPage = () => {
  const sortRequirementModules = (): void => {
    const moduleMap = new Map();
    setModulesState((state) => {
      for (let requirement of state.requirements) {
        for (let module of requirement.modules) {
          moduleMap.set(module.code, module);
        }
      }
      // for (let i = 0; i < sampleModuleRequirements.length; i++) {
      //   state.requirements[i].modules = [];
      //   for (let module of sampleModuleRequirements[i].modules) {
      //     console.log(module);
      //     if (moduleMap.has(module.code)) {
      //       state.requirements[i].modules.push(module);
      //     }
      //   }
      // }
      for (let i = 0; i < moduleRequirementsCodes.length; i++) {
        state.requirements[i].modules = [];
        for (let code of moduleRequirementsCodes[i]) {
          if (moduleMap.has(code)) {
            state.requirements[i].modules.push(moduleMap.get(code));
          }
        }
      }

      return state;
    });
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    console.log(`handle drag over, active: ${active.id}, over: ${over.id}`);

    if (!over || !over.id) {
      setActiveId(null);
      return;
    }

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

    const activeContainer = active.data.current.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || over.id;

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

            newState.planner[semIdx].modules = arrayMove(
              newState.planner[semIdx].modules,
              activeIndex,
              overIndex
            );

            return newState;
          } else if (containerType === "requirement") {
            var newState: ModulesState = { ...state };
            // const requirementIndex = getRequirementIndex(containerId[1]);
            const requirementIndex = parseInt(containerId[1]);
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
    sortRequirementModules();
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
      newState.planner[semIdx].modules = removeAtIndex(
        newState.planner[semIdx].modules,
        activeIndex
      );
    }
    if (activeContainerType == "requirement") {
      var reqIdx = parseInt(activeContainerId[1]);
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
      newState.planner[semIdx].modules = insertAtIndex(
        newState.planner[semIdx].modules,
        overIndex,
        item
      );
    }

    if (overContainerType == "requirement") {
      // var reqIdx = getRequirementIndex(overContainerId[1]);
      var reqIdx = parseInt(overContainerId[1]);
      newState.requirements[reqIdx].modules = insertAtIndex(
        newState.requirements[reqIdx].modules,
        overIndex,
        item
      );
    }
    console.log(newState);
    return newState;
  };

  const handleModuleClose = (module: Module) => {
    const newModulesState = { ...modulesState };

    // Remove module from planner
    for (let i = 0; i < newModulesState.planner.length; i++) {
      for (let j = 0; j < newModulesState.planner[i].modules.length; j++) {
        if (newModulesState.planner[i].modules[j].code === module.code) {
          newModulesState.planner[i].modules = removeAtIndex(
            newModulesState.planner[i].modules,
            j
          );
          break;
        }
      }
    }
    newModulesState.requirements[0].modules.push(module);
    setModulesState(newModulesState);
    sortRequirementModules();
  };

  const [activeId, setActiveId] = useState(null);

  const [moduleRequirements, setModuleRequirements] = useState<Requirement[]>({
    ...sampleModuleRequirements,
  });

  const moduleRequirementsCodes = sampleModuleRequirements.map((x) =>
    x.modules.map((mod) => mod.code)
  );

  const [modulesState, setModulesState] =
    useState<ModulesState>(dummyModuleState);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragOver={handleDragOver}
      sensors={sensors}
    >
      <div />
      <Heading
        fontSize={"xl"}
        fontWeight={"bold"}
        fontFamily={"body"}
        padding="1em"
      >
        Required Modules
      </Heading>
      <Box
        bgColor="purple.50"
        margin="1em 1em 4em"
        borderColor="black"
        padding="0.5em"
        borderRadius="0.5em"
      >
        <VStack
          align="left"
          divider={<StackDivider borderColor="purple.300" />}
        >
          {modulesState.requirements.map((requirement, id) => (
            <RequirementContainer
              requirement={requirement}
              id={"requirement:" + id.toString()}
            />
          ))}
        </VStack>
      </Box>
      <Heading
        fontSize={"xl"}
        fontWeight={"bold"}
        fontFamily={"body"}
        padding="1em"
      >
        Study Plan
      </Heading>
      <Box margin="1em 1em 4em" borderColor="black" padding="0.5em">
        <HStack align="top" divider={<StackDivider borderColor="gray.400" />}>
          {modulesState.planner.map((semester, id) => (
            <PlannerContainer
              semester={semester}
              handleModuleClose={handleModuleClose}
              id={"planner:" + id.toString()}
            />
          ))}
        </HStack>
      </Box>
    </DndContext>
  );
};

export default RyanTestPage;

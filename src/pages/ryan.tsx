import {
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

const dummyModuleState: ModulesState = {
  requirements: [
    {
      title: "Computer Science Foundation",
      description: "Compulsory modules",
      totalCredits: 36,
      modules: [
        { code: "CS1101S", name: "Programming Methodology", credits: 4 },
        { code: "CS1231S", name: "Discrete Structures", credits: 4 },
        { code: "CS3230", name: "Programming Methodology II", credits: 4 },
        { code: "CS2040S", name: "Data Structures and Algorithms", credits: 4 },
        { code: "CS2100", name: "Computer Organisation", credits: 4 },
        { code: "CS2103T", name: "Software Engineering", credits: 4 },
        { code: "CS2105", name: "Introduction to Computer Networks", credits: 4 },
        { code: "CS2106", name: "Introduction to Operating Systems", credits: 4 },
        { code: "CS3230", name: "Design and Analysis of Algorithms", credits: 4 },

      ],
    },
    {
      title: "Focus Area and Level-4000 or Above",
      description: "1. 3 modules in the Area Primaries, with at least one module at level-4000 or above. "
                 + "Computer Science Foundation modules that appear in Area Primaries can be counted as "
                 + "one of the 3 modules towards satisfying a Focus Area."
                 + "2. At least 12 MCs are at level-4000 or above.",
      totalCredits: 24,
      modules: [
        { code: "Any Primary", name: "Select A Module", credits: null },
        { code: "Any Primary", name: "Select A Module", credits: null },
        { code: "Any Primary", name: "Select A Module", credits: null },
      ],
    },
    {
      title: "Computer Systems Team Project",
      description: "At least 8 MCs of Computer Systems Team Project modules. CS3216 and CS3217, CS3281 and CS3282 "
                 + "are to be taken together to fulfill the requirement",
      totalCredits: 8,
      modules: [
        { code: "CS3203", name: "Software Engineering Project", credits: 8 },
        { code: "CS3216", name: "Software Product Engineering for Digital Markets", credits: 5 },
        { code: "CS3217", name: "Software Engineering on Modern Application Platforms", credits: 5 },
        { code: "CS3281", name: "Thematic Systems Project I", credits: 4 },
        { code: "CS3282", name: "Thematic Systems Project II", credits: 4 }
      ],
    },
    {
      title: "IT Professionalism",
      description: "",
      totalCredits: 12,
      modules: [
        { code: "IS1103/X", name: "IS Innovations in Organisations and Society", credits: 4 },
        { code: "CS2101", name: "Effective Communication for Computing Professionals", credits: 4 },
        { code: "ES2660", name: "Communicating in the Information Age", credits: 4 },
      ],
    },
    {
      title: "Mathematics and Sciences",
      description: "",
      totalCredits: 16,
      modules: [
        { code: "MA1521", name: "Calculus for Computing", credits: 4 },
        { code: "MA1101R", name: "Linear Algebra I or MA2001 Linear Algebra I", credits: 4 },
        { code: "ST2334", name: "Probability and Statistics 5 and one Science Module", credits: 8 },
      ],
    },
    {
      title: "Elective Modules",
      description: "",
      totalCredits: 32,
      modules: [
        { code: "Any UE", name: "Select A Module", credits: 4 },
        { code: "Any UE", name: "Select A Module", credits: 4 },
        { code: "Any UE", name: "Select A Module", credits: 4 },
        { code: "Any UE", name: "Select A Module", credits: 4 },
        { code: "Any UE", name: "Select A Module", credits: 4 },
        { code: "Any UE", name: "Select A Module", credits: 4 },
        { code: "Any UE", name: "Select A Module", credits: 4 },
        { code: "Any UE", name: "Select A Module", credits: 4 },
      ],
    },
  ],
  planner: [
    {
      year: 1,
      semester: 1,
      modules: []
    },
    {
      year: 1,
      semester: 2,
      modules: []
    },
  ],

  startYear: "",
};

// Container id naming scheme:
// For requirements: Container id = requirements.title
// For planner: Container id = planner array idx (0,1,2,...)
// Concern: Do we care about special term?

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

            newState.planner[semIdx] = arrayMove(
              newState.planner[semIdx],
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
      newState.planner[semIdx] = insertAtIndex(
        newState.planner[semIdx],
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

    for (let i = 0; i < newModulesState.planner.length; i++) {
      for (let j = 0; j < newModulesState.planner[i].length; j++) {
        if (newModulesState.planner[i][j].code === module.code) {
          newModulesState.planner[i] = removeAtIndex(
            newModulesState.planner[i],
            j
          );
          break;
        }
      }
    }

    for (let i = 0; i < moduleRequirements.length; i++) {
      for (let j = 0; j < moduleRequirements[i].modules.length; j++) {
        if (moduleRequirements[i].modules[j].code === module.code) {
          newModulesState.requirements[i].modules.push(module);
        }
      }
    }

    setModulesState(newModulesState);
  };

  const [activeId, setActiveId] = useState(null);

  const [moduleRequirements, setModuleRequirements] = useState<Requirement[]>(
    sampleModuleRequirements
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
              id={"requirement:" + id.toString()}
            />
          ))}
        </VStack>
      </Box>
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

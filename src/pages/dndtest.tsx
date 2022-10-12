import { Box, HStack } from "@chakra-ui/react";
import { useState } from "react";
import PlannerContainer from "../components/PlannerContainer";
import RequirementContainer from "../components/RequirementContainer";
import { Module, Requirement, ModulesState } from "../interfaces/planner";
import { DragDropContext } from "react-beautiful-dnd";
import { itemsEqual } from "@dnd-kit/sortable/dist/utilities";

const sampleModuleRequirements: Requirement[] = [
  {
    title: "Computer Science Foundation",
    description: "Compulsory modules",
    totalCredits: 36,
    modules: [
      {
        category: 1,
        code: "CS1101S",
        name: "Programming Methodology",
        credits: 4,
      },
      { category: 1, code: "CS1231S", name: "Discrete Structures", credits: 4 },
      {
        category: 1,
        code: "CS2030S",
        name: "Programming Methodology II",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2040S",
        name: "Data Structures and Algorithms",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2100",
        name: "Computer Organisation",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2103T",
        name: "Software Engineering",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2105",
        name: "Introduction to Computer Networks",
        credits: 4,
      },
      {
        category: 1,
        code: "CS2106",
        name: "Introduction to Operating Systems",
        credits: 4,
      },
      {
        category: 1,
        code: "CS3230",
        name: "Design and Analysis of Algorithms",
        credits: 4,
      },
    ],
  },
];

const TestDnd = () => {
  const [requirements, setRequirements] = useState(sampleModuleRequirements);

  const handleDragEnd = (result) => {
    console.log(requirements);
    const reqs = [...requirements];
    const [reorder] = reqs[0].modules.splice(result.source.index, 1);
    reqs[0].modules.splice(result.destination.index, 0, reorder);
    console.log(reqs);
    setRequirements(reqs);
  };

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box margin="0em 0.5em 4em" borderColor="black" padding="0.5em">
          <HStack align="top">
            {requirements.map((requirement, id) => (
              <RequirementContainer
                requirement={requirement}
                id={"requirement:" + id.toString()}
                key={id}
              />
            ))}
          </HStack>
        </Box>
      </DragDropContext>
    </div>
  );
};

export default TestDnd;

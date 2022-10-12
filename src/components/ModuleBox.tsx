import {
  Input,
  Select,
  Box,
  Heading,
  Text,
  IconButton,
  Flex,
  Spacer,
  Button,
  color,
} from "@chakra-ui/react";
import { Module } from "../interfaces/planner";
import { CloseIcon } from "@chakra-ui/icons";
import { primaries } from "../constants/dummyModuleData";
import { Draggable } from "react-beautiful-dnd";

interface ModuleBoxProps {
  module: Module;
  displayModuleClose: boolean;
  handleModuleClose?: (module: Module) => void;
  idx: number;
}

const ModuleBox = ({
  module,
  displayModuleClose,
  handleModuleClose,
  idx,
}: ModuleBoxProps) => {
  let text;
  if (module.credits != null) {
    text = <Text fontSize={"xx-small"}>{module.credits}MCs</Text>;
  }

  let moduleColor;
  if (module.category == 1) {
    moduleColor = "blue.100";
  } else if (module.category == 2) {
    moduleColor = "orange.100";
  } else if (module.category == 3) {
    moduleColor = "purple.100";
  } else if (module.category == 4) {
    moduleColor = "green.100";
  } else if (module.category == 5) {
    moduleColor = "red.100";
  } else if (module.category == 6) {
    moduleColor = "yellow.100";
  }

  let modName;
  if (module.name != "Select A Module") {
    modName = (
      <Text color="black.900" fontSize={"xs"}>
        {module.name}
      </Text>
    );
  } else {
    if (module.code.split(":")[0] == "Any Primary") {
      modName = (
        <Select
          placeholder="Select A Module"
          borderColor={"black"}
          size="sm"
          marginTop={"2"}
        >
          {primaries.map((primary) => (
            <option> {primary} </option>
          ))}
        </Select>
      );
    } else if (module.code.split(":")[0] == "Any UE") {
      modName = (
        <Input
          borderColor={"black"}
          size="sm"
          marginTop={"2"}
          placeholder="Key in a module"
        ></Input>
      );
    }
  }

  return (
    <div>
      <Draggable key={module.code} draggableId={module.code} index={idx}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <Box
              w="12rem"
              h="5rem"
              bgColor={moduleColor}
              alignContent="center"
              margin="0"
              marginBottom="0.4rem"
              borderBottom="0.2rem"
              borderRadius="0.4rem"
              border="0px"
              borderColor="grey.300"
              padding="0.2rem 0.5rem"
            >
              <Flex>
                <Text fontSize={"medium"} color="black.900" fontWeight="bold">
                  {module.code.split(":")[0]}{" "}
                </Text>
                <Spacer />
                {displayModuleClose && (
                  <IconButton
                    icon={<CloseIcon />}
                    aria-label="Remove Module"
                    size="xs"
                    bgColor={moduleColor}
                    color="black"
                    colorScheme={moduleColor}
                    onClick={() => {
                      console.log("hi");
                      handleModuleClose(module);
                    }}
                  />
                )}
              </Flex>
              {modName}
              {text}
            </Box>
            
          </div>
        )}
      </Draggable>
    </div>
  );
};

export default ModuleBox;

// padding: $module-padding-v $module-padding-h;
// margin-bottom: 0.4rem;
// border-bottom: 0.15rem solid darken(theme-color('success'), 10);
// border-radius: 0.35rem;
// font-size: 0.9rem;
// line-height: 1.3;
// color: darken(theme-color('success'), 30);
// background: lighten(theme-color('success'), 3);

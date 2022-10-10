import {
  Box,
  Heading,
  Text,
  IconButton,
  Flex,
  Spacer,
  Button,
  color,
} from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Module } from "../interfaces/planner";
import { CloseIcon } from "@chakra-ui/icons";

interface ModuleBoxProps {
  module: Module;
  displayModuleClose: boolean;
  handleModuleClose?: (module: Module) => void;
}

const ModuleBox = ({
  module,
  displayModuleClose,
  handleModuleClose,
}: ModuleBoxProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: module.code });

  const style = { transform: CSS.Transform.toString(transform), transition };
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

  return (
    <div>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
          <Text color="black.900" fontSize={"xs"}>
            {module.name}
          </Text>
          {text}
        </Box>
      </div>
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

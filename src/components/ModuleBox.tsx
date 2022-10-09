import {
  Box,
  Heading,
  Text,
  IconButton,
  Flex,
  Spacer,
  Button,
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

  return (
    <div>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Box
          w="16rem"
          h="5rem"
          bgColor="green.100"
          alignContent="center"
          margin="0"
          marginBottom="0.4rem"
          borderBottom="0.2rem"
          borderRadius="0.4rem"
          border="1px"
          borderColor="grey.300"
          padding="0.2rem 0.5rem"
        >
          <Flex>
            <Text fontWeight="bold">{module.code} </Text>
            <Spacer />
            {displayModuleClose && (
              <IconButton
                icon={<CloseIcon />}
                aria-label="Remove Module"
                size="sm"
                onClick={() => {
                  console.log("hi");
                  handleModuleClose(module);
                }}
              />
            )}
          </Flex>

          <Text>{module.name}</Text>
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

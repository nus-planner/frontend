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

  return (
    <div>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <Box
          w="12rem"
          h="5rem"
          bgColor="purple.100"
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
            <Text fontSize={'medium'} color='purple.00' fontWeight="bold">{module.code} </Text>
            <Spacer />
            {displayModuleClose && (
              <IconButton
                icon={<CloseIcon />}
                aria-label="Remove Module"
                size='xs'
                backgroundColor={'purple.300'}
                color='purple.100'
                onClick={() => {
                  console.log("hi");
                  handleModuleClose(module);
                }}
              />
            )}
          </Flex>
          <Text color='purple.900' fontSize={'xs'}>{module.name}</Text>
          <Text color='purple.700' fontSize={'xx-small'}>{module.credits}MCs</Text>
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

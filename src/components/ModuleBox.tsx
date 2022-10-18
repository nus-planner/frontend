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
  Link,
} from "@chakra-ui/react";
import { Module } from "../interfaces/planner";
import { CloseIcon } from "@chakra-ui/icons";
import { primaries } from "../constants/dummyModuleData";
import { Draggable } from "react-beautiful-dnd";
import { DEFAULT_MODULE_COLOR } from "../constants/moduleColor";
import { getNUSModsModulePage } from "../utils/moduleUtils";

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
  let text: any;
  if (module.credits != null) {
    text = <Text fontSize={"xx-small"}>{module.credits}MCs</Text>;
  }

  let modName: any;
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
          {primaries.map((primary, idx) => (
            <option key={idx}> {primary} </option>
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

  const moduleColor = module.prereqsViolated?.length
    ? "red.300"
    : module.color ?? DEFAULT_MODULE_COLOR;

  const isModuleCode = !!module.code.match(/[A-Z]+\d+[A-Z]*/);

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
              borderRadius="0.4rem"
              padding="0.2rem 0.5rem"
            >
              <Flex>
                <Text fontSize={"medium"} color="black.900" fontWeight="bold">
                  {isModuleCode && (
                    <Link href={getNUSModsModulePage(module.code)} isExternal>
                      {module.code}
                    </Link>
                  )}
                  {!isModuleCode && <>{module.code.split(":")[0]}</>}
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
                      if (handleModuleClose !== undefined) {
                        handleModuleClose(module);
                      }
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

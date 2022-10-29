import {
  Box,
  Text,
  Icon,
  IconButton,
  Flex,
  Spacer,
  Link,
  UnorderedList,
  HStack,
  Badge,
  Wrap,
} from "@chakra-ui/react";
import { Module } from "../interfaces/planner";
import { CloseIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { Draggable } from "react-beautiful-dnd";
import { DEFAULT_MODULE_COLOR } from "../constants/moduleColor";
import {
  convertPrereqTreeToString,
  getNonDuplicateUEs,
  getNUSModsModulePage,
} from "../utils/moduleUtils";
import { useAppContext } from "./AppContext";
import ModuleDropdown from "./ModuleDropdown";
import { useEffect, useState } from "react";

interface ModuleBoxProps {
  module: Module;
  displayModuleClose: boolean;
  handleModuleClose?: (module: Module) => void;
  parentStr: string;
  idx: number;
}

const ModuleBox = ({
  module,
  displayModuleClose,
  handleModuleClose,
  parentStr,
  idx,
}: ModuleBoxProps) => {
  const { mainViewModel, setMainViewModel } = useAppContext();
  let moduleColor: string;
  if (module.color) {
    if (module.color.length === 1) {
      moduleColor = module.color[0];
    } else {
      moduleColor = "linear(to-r,";
      for (let i = 0; i < module.color.length; i++) {
        moduleColor += module.color[i] + ",";
      }
      moduleColor += ")";
    }
  } else {
    moduleColor = DEFAULT_MODULE_COLOR;
  }

  let options: any[] = [];

  const [mods, setMods] = useState<Module[]>([]);
  const existingModules: string[] = [];
  for (let i = 0; i < mainViewModel.requirements.length; i++) {
    for (let j = 0; j < mainViewModel.requirements[i].modules.length; j++) {
      existingModules.push(mainViewModel.requirements[i].modules[j].code);
    }
  }

  useEffect(() => {
    if (!module.isMultiModule) {
      return;
    }
    getNonDuplicateUEs(existingModules).then((mods) => {
      console.log(module);
      const regexp = new RegExp(module.code);
      const filterResult = mods.filter((mod) => regexp.test(mod.code));
      setMods(filterResult);
    });
  }, []);

  function getStyle(style: any, snapshot: any) {
    if (!snapshot.isDropAnimating) {
      return style;
    }
    return {
      ...style,
      // cannot be 0, but make it super tiny
      transitionDuration: `0.000001s`,
    };
  }

  if (module.isMultiModule) {
    for (const mod of mods) {
      options.push({
        label: mod.code + " " + mod.name,
        value: mod.code,
      });
    }
  }

  return (
    <div>
      <Draggable
        key={module.id + "|" + parentStr}
        draggableId={module.id + "|" + parentStr}
        index={idx}
      >
        {(provided, snapshot) => (
          <div>
            <div
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              style={getStyle(provided.draggableProps.style, snapshot)}
            >
              <Flex
                w="12rem"
                minH="5.5rem"
                bgColor={moduleColor}
                bgGradient={moduleColor}
                alignContent="center"
                borderRadius="0.4rem"
                padding="0.2rem 0.5rem"
                whiteSpace={"initial"}
                flexDirection="column"
              >
                <Flex>
                  <Text fontSize={"medium"} color="black.900" fontWeight="bold">
                    {!module.isMultiModule ? (
                      <Link href={getNUSModsModulePage(module.code)} isExternal>
                        {module.code}
                      </Link>
                    ) : (
                      module.name
                    )}
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
                {module.isMultiModule ? (
                  <ModuleDropdown
                    module={module}
                    options={options}
                    isDragging={snapshot.isDragging}
                    isExemption={false}
                  />
                ) : (
                  <Text color="black.900" fontSize={"xs"}>
                    {module.name}
                  </Text>
                )}
                <Spacer />
                <Flex>
                  <Wrap ml="-0.2rem" spacing="1" alignSelf='flex-end'>
                    {module.tags?.map((tag, idx) => (
                      <Badge
                        key={idx}
                        size="sm"
                        fontSize="0.5rem"
                        variant="outline"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Wrap>
                  <Spacer />
                  {module.credits != null && module.credits > 0 && (
                    <Text fontSize={"x-small"} alignSelf="flex-end">
                      {module.credits}MCs
                    </Text>
                  )}
                </Flex>

                {!!module.prereqsViolated?.length && (
                  <div>
                    <HStack>
                      <Icon as={WarningTwoIcon} color="red.500" />
                      <Text
                        fontSize={"xs"}
                        fontWeight="bold"
                        color={"red.500"}
                        pt="1"
                      >
                        These modules might need to be taken first:
                      </Text>
                    </HStack>
                    <UnorderedList
                      fontSize={"xs"}
                      fontWeight="bold"
                      color={"red.500"}
                    >
                      {module.prereqsViolated
                        .map((x) => convertPrereqTreeToString(x))
                        .map((v, idx) => (
                          <li key={idx}>{v}</li>
                        ))}
                    </UnorderedList>
                  </div>
                )}
                {!!module.coreqsViolated?.length && (
                  <div>
                    <HStack>
                      <Icon as={WarningTwoIcon} color="red.500" />
                      <Text
                        fontSize={"xs"}
                        fontWeight="bold"
                        color={"red.500"}
                        pt="1"
                      >
                        These modules might need to be taken at the same time:
                      </Text>
                    </HStack>
                    <UnorderedList
                      fontSize={"xs"}
                      fontWeight="bold"
                      color={"red.500"}
                    >
                      {module.coreqsViolated.map((v, idx) => (
                        <li key={idx}>{v}</li>
                      ))}
                    </UnorderedList>
                  </div>
                )}
              </Flex>
            </div>
            {snapshot.isDragging && <Box w="12rem" visibility="hidden" />}
          </div>
        )}
      </Draggable>
    </div>
  );
};

export default ModuleBox;

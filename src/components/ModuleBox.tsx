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
} from "@chakra-ui/react";
import { Module } from "../interfaces/planner";
import { CloseIcon, WarningTwoIcon } from "@chakra-ui/icons";
import { Draggable } from "react-beautiful-dnd";
import { DEFAULT_MODULE_COLOR } from "../constants/moduleColor";
import {
  getGEsFromModuleList,
  getNonDuplicateUEs,
  getNUSModsModulePage,
  fetchedModuleListPromise,
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
  const moduleColor = module.color ?? DEFAULT_MODULE_COLOR;
  let text: any;
  if (module.credits != null && module.credits > 0) {
    text = <Text fontSize={"xx-small"}>{module.credits}MCs</Text>;
  }

  let options: any[] = [];
  let moduleBoxBody: React.ReactElement;
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
      const regexp = new RegExp(module.code);
      const filterResult = mods.filter((mod) => regexp.test(mod.code));
      setMods(filterResult);
    });
  }, []);

  if (module.isMultiModule) {
    for (const mod of mods) {
      options.push({
        label: mod.code + " " + mod.name,
        value: mod.code,
      });
    }
    moduleBoxBody = <ModuleDropdown module={module} options={options} />;
  } else {
    moduleBoxBody = (
      <Text color="black.900" fontSize={"xs"}>
        {module.name}
      </Text>
    );
  }

  let prereqsViolationText: any;
  if (module.prereqsViolated?.length) {
    let violations: string[] = [];
    for (let or of module.prereqsViolated) {
      violations.push(or.join(" or "));
    }
    prereqsViolationText = (
      <div>
        <HStack>
          <Icon as={WarningTwoIcon} color="red.500" />
          <Text fontSize={"xs"} fontWeight="bold" color={"red.500"} pt="1">
            These modules might need to be taken first:
          </Text>
        </HStack>
        <UnorderedList fontSize={"xs"} fontWeight="bold" color={"red.500"}>
          {violations.map((v, idx) => (
            <li key={idx}>{v}</li>
          ))}
        </UnorderedList>
      </div>
    );
  }

  let coreqsViolationText: any;
  if (module.coreqsViolated?.length) {
    coreqsViolationText = (
      <div>
        <HStack>
          <Icon as={WarningTwoIcon} color="red.500" />
          <Text fontSize={"xs"} fontWeight="bold" color={"red.500"} pt="1">
            These modules might need to be taken at the same time:
          </Text>
        </HStack>
        <UnorderedList fontSize={"xs"} fontWeight="bold" color={"red.500"}>
          {module.coreqsViolated.map((v, idx) => (
            <li key={idx}>{v}</li>
          ))}
        </UnorderedList>
      </div>
    );
  }

  return (
    <div>
      <Draggable
        key={module.code + "|" + parentStr}
        draggableId={module.code + "|" + parentStr}
        index={idx}
      >
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <Box
              w="12rem"
              minH="5rem"
              bgColor={moduleColor}
              alignContent="center"
              borderRadius="0.4rem"
              padding="0.2rem 0.5rem"
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
              {moduleBoxBody}
              {text}
              {prereqsViolationText}
              {coreqsViolationText}
              <Text fontSize={"xx-small"}>{module.tags?.join(",")}</Text>
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

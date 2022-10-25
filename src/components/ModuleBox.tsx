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

  const isGE = module.code.startsWith("^GE");
  const isUE = module.code.startsWith(".");

  let modName: any;
  let GEOptions = [];
  const [GEs, setGEs] = useState<Module[]>([]);
  const getGEs = async () => {
    const GEs = await getGEsFromModuleList(module.code.slice(1, 4));
    setGEs(GEs);
  };
  useEffect(() => {
    getGEs();
  }, []);

  let UEOptions = [];
  const [UEs, setUEs] = useState<Module[]>([]);
  const existingModules: string[] = [];
  for (let i = 0; i < mainViewModel.requirements.length; i++) {
    for (let j = 0; j < mainViewModel.requirements[i].modules.length; j++) {
      existingModules.push(mainViewModel.requirements[i].modules[j].code);
    }
  }
  const getUEs = async () => {
    const UEs = await getNonDuplicateUEs(existingModules);
    setUEs(UEs);
  };
  useEffect(() => {
    getUEs();
  }, []);

  if (module.name == "Select A Basket") {
    if (isGE) {
      for (let GE of GEs) {
        GEOptions.push({
          label: GE.code + " " + GE.name,
          value: GE.code,
        });
      }
      modName = <ModuleDropdown module={module} options={GEOptions} />;
    } else if (isUE) {
      for (let UE of UEs) {
        UEOptions.push({
          label: UE.code + " " + UE.name,
          value: UE.code,
        });
      }
      modName = <ModuleDropdown module={module} options={UEOptions} />;
    }
  } else {
    modName = (
      <Text color="black.900" fontSize={"xs"}>
        {module.name}
      </Text>
    );
  }

  const isValidModuleCode = !!module.code.match(/[A-Z]+\d+[A-Z]*/);

  let prereqsViolationText: any;
  if (module.prereqsViolated?.length) {
    let violations: string[] = [];
    for (let or of module.prereqsViolated) {
      violations.push(or.join(" or "));
    }
    prereqsViolationText = (
      <div>
        <HStack>
        <Icon as={WarningTwoIcon} color="red.500"/>
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
                  {isValidModuleCode && (
                    <Link href={getNUSModsModulePage(module.code)} isExternal>
                      {module.code}
                    </Link>
                  )}
                  {isGE && <>{"Any " + module.code.slice(1, 4)}</>}
                  {!isValidModuleCode && !isGE && "Any UE"}
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
              {prereqsViolationText}
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

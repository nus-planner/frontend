import {
  IconButton,
  Text,
  Box,
  VStack,
  Flex,
  Spacer,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";

import { Module, Semester } from "../interfaces/planner";
import ModuleBox from "./ModuleBox";
import { Droppable } from "react-beautiful-dnd";
import ModuleDropdown from "./ModuleDropdown";
import { useEffect, useState } from "react";
import { getNonDuplicateUEs } from "../utils/moduleUtils";
import { useAppContext } from "./AppContext";

interface ExemptionContainerProps {
  exemptedModules: Module[];
  id: string;
  handleModuleClose: (module: Module) => void;
}

const ExemptionContainer = ({
  exemptedModules,
  id,
  handleModuleClose,
}: ExemptionContainerProps) => {
  const { mainViewModel, setMainViewModel } = useAppContext();
  const [mods, setMods] = useState<Module[]>([]);
  const options = [];

  useEffect(() => {
    getNonDuplicateUEs([]).then((mods) => {
      setMods(mods);
    });
  }, []);

  for (const mod of mods) {
    options.push({
      label: mod.code + " " + mod.name,
      value: mod.code,
    });
  }

  const exemptionTag = (module: Module) => {
    return (
      <Tag
        key={module.code}
        variant="outline"
        colorScheme="blue"
        mr={"0.5rem"}
        mt={"0.5rem"}
        size="lg"
      >
        <TagLabel> {module.code} </TagLabel>
        <TagCloseButton
          onClick={() => {
            if (handleModuleClose !== undefined) {
              handleModuleClose(module);
            }
          }}
        />
      </Tag>
    );
  };

  return (
    <Box borderRadius="0.4rem" minH="22sem" color={"blackAlpha.50"}>
      <ModuleDropdown
        options={options}
        isDragging={false}
        isExemption={true}
        module={{ code: ".", name: "exemptions", id: id, credits: -1 }}
      />
      {exemptedModules.map((module) => exemptionTag(module))}
    </Box>
  );
};

export default ExemptionContainer;

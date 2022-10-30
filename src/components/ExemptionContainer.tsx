import {
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Link,
  Tooltip,
  Text,
} from "@chakra-ui/react";

import { Module, Semester } from "../interfaces/planner";
import ModuleBox from "./ModuleBox";
import { Droppable } from "react-beautiful-dnd";
import ModuleDropdown from "./ModuleDropdown";
import { useEffect, useState } from "react";
import { getNonDuplicateUEs, getNUSModsModulePage } from "../utils/moduleUtils";
import { useAppContext } from "./AppContext";

interface ExemptionContainerProps {
  exemptedModules: Module[];
  id: string;
  handleModuleClose: (module: Module) => void;
  forceUpdate: () => void;
}

const ExemptionContainer = ({
  exemptedModules,
  id,
  handleModuleClose,
  forceUpdate,
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

  return (
    <Box borderRadius="0.4rem" minH="22sem" color={"blackAlpha.50"}>
      <ModuleDropdown
        options={options}
        isDragging={false}
        isExemption={true}
        module={{ code: ".", name: "exemptions", id: id, credits: -1 }}
        forceUpdate={forceUpdate}
      />
      {exemptedModules.map((module) => (
        <Tooltip
          label={
            <>
              <span style={{ fontWeight: "bold" }}>{module.code}:</span>{" "}
              {module.name}
            </>
          }
          borderRadius="5px"
          key={module.code}
        >
          <Tag
            variant="outline"
            colorScheme="blue"
            mr={"0.5rem"}
            mt={"0.5rem"}
            size="lg"
          >
            <TagLabel>
              <Link href={getNUSModsModulePage(module.code)} isExternal>
                {module.code}
              </Link>
            </TagLabel>
            <TagCloseButton
              onClick={() => {
                if (handleModuleClose !== undefined) {
                  handleModuleClose(module);
                }
              }}
            />
          </Tag>
        </Tooltip>
      ))}
    </Box>
  );
};

export default ExemptionContainer;

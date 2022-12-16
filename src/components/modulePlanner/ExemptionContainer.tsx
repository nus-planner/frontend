import {
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Link,
  Tooltip,
  Heading,
} from "@chakra-ui/react";

import { Module } from "../../interfaces/planner";
import ModuleDropdown from "../moduleBox/ModuleDropdown";
import { useEffect, useState } from "react";
import {
  applyPrereqValidation,
  getNonDuplicateUEs,
  getNUSModsModulePage,
} from "../../utils/moduleUtils";
import { useAppContext } from "../AppContext";
import { sortRequirementModules } from "../../utils/plannerUtils";

interface ExemptionContainerProps {
  exemptedModules: Module[];
  id: string;
  forceUpdate: () => void;
  setIsValidateButtonDisabled: (isDisabled: boolean) => void;
  exemptionType: "exemption" | "apc";
}

const ExemptionContainer = ({
  exemptedModules,
  id,
  forceUpdate,
  setIsValidateButtonDisabled,
  exemptionType,
}: ExemptionContainerProps) => {
  const { mainViewModel, setMainViewModel } = useAppContext();
  const [mods, setMods] = useState<Module[]>([]);
  const options = [];

  useEffect(() => {
    getNonDuplicateUEs(mainViewModel.moduleYears, []).then((mods) => {
      setMods(mods);
    });
  }, []);

  for (const mod of mods) {
    options.push({
      label: mod.code + " " + mod.name,
      value: mod.code,
    });
  }

  const handleExemptionClose = async (module: Module) => {
    module.prereqsViolated = [];
    module.coreqsViolated = [];

    if (exemptionType === "exemption") {
      mainViewModel.exemptions.filtered((mod) => mod.code !== module.code);
    }
    if (exemptionType === "apc") {
      mainViewModel.apcs.filtered((mod) => mod.code !== module.code);
    }

    mainViewModel.removeModuleViewModelFromGlobalState(module.code);
    await applyPrereqValidation(
      mainViewModel.startYear,
      mainViewModel.planner,
    ).then((semesters) => {
      const isPrereqsViolated =
        semesters
          .slice(2)
          .map((semester) => semester.modules)
          .flat(1)
          .filter((module) => module.prereqsViolated?.length).length > 0;
      setIsValidateButtonDisabled(isPrereqsViolated);
      return isPrereqsViolated;
    });

    sortRequirementModules(mainViewModel);
    mainViewModel.validate();
    forceUpdate();
  };

  return (
    <Box w="50%" padding="0 0.5rem 0 0">
      <Heading
        fontSize={"xl"}
        fontWeight={"bold"}
        fontFamily={"body"}
        padding="0.5em 0em 0.4rem"
      >
        {exemptionType === "exemption" ? "Exemptions" : "APCs"}
      </Heading>
      <Box borderColor="black">
        <Box borderRadius="0.4rem" minH="22sem" color={"blackAlpha.50"}>
          <ModuleDropdown
            options={options}
            isDragging={false}
            isExemption={exemptionType === "exemption"}
            isAPC={exemptionType === "apc"}
            module={{ code: ".", name: "exemptions", id: id, credits: -1 }}
            forceUpdate={forceUpdate}
            setIsValidateButtonDisabled={setIsValidateButtonDisabled}
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
                    handleExemptionClose(module);
                  }}
                />
              </Tag>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ExemptionContainer;

import Select, {
  ActionMeta,
  FormatOptionLabelMeta,
  SingleValue,
} from "react-select";
import { FormControl, Text } from "@chakra-ui/react";
import { fetchBasicModuleInfo } from "../api/moduleAPI";
import { Module } from "../interfaces/planner";
import * as models from "../models";
import { useAppContext } from "./AppContext";
import { DEFAULT_MODULE_COLOR, moduleColor } from "../constants/moduleColor";
import { labelModules } from "../utils/plannerUtils";
import { Context } from "@dnd-kit/sortable/dist/components";
import React from "react";

interface ModuleDropdownProps {
  module: Module;
  options: any;
}

const ModuleDropdown = ({ module, options }: ModuleDropdownProps) => {
  const { mainViewModel, setMainViewModel } = useAppContext();
  let underlyingModule: models.Module | null = null;

  if (module.getUnderlyingModule) {
    const tempModule = module.getUnderlyingModule();
    if (tempModule !== undefined) {
      underlyingModule = tempModule;
    }
  }

  const handleChange = async (
    selectedModule: SingleValue<{ label: string; value: string }>,
    _: ActionMeta<{ label: string; value: string }>,
  ) => {
    if (selectedModule === null || selectedModule.value === undefined) return;

    const basicModuleInfo = await fetchBasicModuleInfo(selectedModule.value);
    let newUnderlyingModule: models.Module;
    if (basicModuleInfo === undefined) {
      newUnderlyingModule = new models.Module(selectedModule.value, "", 4);
    } else {
      newUnderlyingModule = new models.Module(
        basicModuleInfo.moduleCode,
        basicModuleInfo.title,
        basicModuleInfo.moduleCredit,
      );
    }

    if (module.selectModule !== undefined) {
      if (underlyingModule !== null) {
        mainViewModel.removeModuleViewModelFromGlobalState(
          underlyingModule.code,
        );
      }

      underlyingModule = newUnderlyingModule;
      module.selectModule(newUnderlyingModule);
      mainViewModel.addModuleToGlobalState(newUnderlyingModule);
    }

    const name = selectedModule.label.replace(selectedModule.value, "");
    setSelectedModuleName(name);
  };

  const moduleColor = module.color ?? DEFAULT_MODULE_COLOR;
  const moduleColorInReact =
    "var(--chakra-colors-" +
    moduleColor.split(".")[0] +
    "-" +
    moduleColor.split(".")[1] +
    ")";
  const moduleColorInReactDarker =
    "var(--chakra-colors-" +
    moduleColor.split(".")[0] +
    "-" +
    (Number(moduleColor.split(".")[1]) + 100) +
    ")";
  const customStyles = {
    option: (provided: any, state: any): any => ({
      ...provided,
      padding: "0.3rem",
      fontSize: "0.7rem",
      color: "black",
      backgroundColor: state.isSelected ? moduleColorInReactDarker : "white",
      "&:hover": {
        backgroundColor: moduleColorInReact,
      },
    }),
    placeholder: (provided: any) => {
      return {
        ...provided,
        fontSize: "0.8rem",
        color: "black",
      };
    },
    singleValue: (defaultStyles: any) => {
      return {
        ...defaultStyles,
        fontSize: "0.8rem",
        color: "black",
      };
    },
    control: (provided: any, state: any) => {
      return {
        ...provided,
        backgroundColor: moduleColorInReactDarker,
        border: 0,
        boxShadow: 0,
      };
    },
    dropdownIndicator: (provided: any) => {
      return {
        ...provided,
        color: "black",
        "&:hover": {
          color: "black",
        },
      };
    },
    indicatorSeparator: (provided: any) => {
      return {
        ...provided,
        backgroundColor: "black",
      };
    },
  };

  const [selectedModuleName, setSelectedModuleName] = React.useState("");
  const formatOptionLabel = (
    data: { label: string; value: string },
    formatOptionLabelMeta: FormatOptionLabelMeta<{ label: string; value: any }>,
  ) => {
    if (formatOptionLabelMeta.context === "value") {
      return <div>{data.value}</div>;
    } else if (formatOptionLabelMeta.context === "menu") {
      return <div>{data.label}</div>;
    }
  };
  const selectedModuleNameDisplay =
    selectedModuleName === "" ? <></> 
    : <Text color="black.900" fontSize={"xs"}>{selectedModuleName}</Text>;

  return (
    <>
      <FormControl>
        <Select
          options={[{ options: options, label: module.code.slice(1, 4) }]}
          placeholder="Select a module"
          value={
            !!underlyingModule
              ? {
                  label: `${underlyingModule.code} ${underlyingModule.name}`,
                  value: underlyingModule.code,
                }
              : undefined
          }
          closeMenuOnSelect={true}
          styles={customStyles}
          menuPosition="fixed"
          onChange={handleChange}
          formatOptionLabel={formatOptionLabel}
        />
      </FormControl>
      {selectedModuleNameDisplay}
    </>
  );
};

export default ModuleDropdown;

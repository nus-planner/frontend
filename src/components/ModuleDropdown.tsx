import  Select, { ActionMeta, SingleValue }  from "react-select";
import { FormControl } from "@chakra-ui/react";
import { fetchBasicModuleInfo } from "../api/moduleAPI";
import { Module } from "../interfaces/planner";
import * as models from "../models";
import { useAppContext } from "./AppContext";

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
  };

  const customStyles = {
    option: (provided: any, state: any): any => ({
      ...provided,
      padding: "0.3rem",
      fontSize: "0.7rem",
      lineHeight: "1rem",
    }),
    placeholder: (defaultStyles: any) => {
      return {
        ...defaultStyles,
        fontSize: "0.8rem",
        backgroundColor: module.color,
      };
    },
  };
  return (
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
      />
    </FormControl>
  );
};

export default ModuleDropdown;

import { Stack, Divider } from "@chakra-ui/react";
import { useState, useCallback, useEffect, SetStateAction } from "react";
import PlannerComponent from "../components/Planner";
import * as models from "../models";
import { labelModules } from "../utils/plannerUtils";
import BasicInfo from "../components/BasicInfo";
import { useAppContext } from "../components/AppContext";

const Home = () => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const { mainViewModel, setMainViewModel } = useAppContext();

  // Basic info of the user
  const years = [];
  const currYear = new Date().getFullYear();
  // Assume a student stays in NUS for at most 5 years
  for (let i = 0; i < 5; i++) {
    years.push(currYear - i);
  }

  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
  const [specialisation, setSpecialisation] = useState("");
  const handleYearChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setYear(event.target.value);
  };
  const handleMajorChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setMajor(event.target.value);
  };
  const handleSpecialisationChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setSpecialisation(event.target.value);
  };

  // TODO: Set up the following to change when corresponding plan is selected

  // useEffect(() => {
  //   mainViewModel
  //     // .initializeFromString(reqStr)
  //     .initializeFromURL(
  //       "https://raw.githubusercontent.com/nus-planner/frontend/main/locals/requirements/cs-2019.json",
  //     )
  //     .then(() => {
  //       forceUpdate();
  //       const moduleArr = Array.from(mainViewModel.modulesMap.values());
  //       labelModules(moduleArr);
  //     });
  // }, []);

  return (
    <Stack padding="1rem">
      <BasicInfo />
      <div />
      <Divider />
      <PlannerComponent />
    </Stack>
  );
};

export default Home;

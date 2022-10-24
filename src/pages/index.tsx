import { Stack, Divider } from "@chakra-ui/react";
import { useState, useCallback, useEffect, SetStateAction } from "react";
import PlannerComponent from "../components/Planner";
import { labelModules } from "../utils/plannerUtils";
import BasicInfo from "../components/BasicInfo";
import { useAppContext } from "../components/AppContext";

const Home = () => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const { mainViewModel, setMainViewModel } = useAppContext();

  // TODO: Set up the following to change when corresponding plan is selected
  useEffect(() => {
    mainViewModel
      // .initializeFromString(reqStr)
      .initializeFromURL(
        "https://raw.githubusercontent.com/nus-planner/frontend/main/locals/requirements/cs-2019.json",
      )
      .then(() => {
        forceUpdate();
        const moduleArr = Array.from(mainViewModel.modulesMap.values());
        labelModules(moduleArr);
      });
  }, []);

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

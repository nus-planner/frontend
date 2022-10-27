import { Stack, Divider } from "@chakra-ui/react";
import { useState, useCallback, useEffect, SetStateAction } from "react";
import PlannerComponent from "../components/Planner";
import { labelModules, loadViewModel } from "../utils/plannerUtils";
import BasicInfo from "../components/BasicInfo";
import { useAppContext } from "../components/AppContext";
import { VIEWMODEL_STORAGE } from "../constants/planner";

const Home = () => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const { mainViewModel, setMainViewModel } = useAppContext();
  
  useEffect(() => {
    loadViewModel(mainViewModel);
    forceUpdate();
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

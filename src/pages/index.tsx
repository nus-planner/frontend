import { Stack, Divider } from "@chakra-ui/react";
import { useState, useCallback, useEffect, SetStateAction } from "react";
import PlannerComponent from "../components/Planner";
import { loadViewModel } from "../utils/plannerUtils";
import BasicInfo from "../components/header/BasicInfo";
import { useAppContext } from "../components/AppContext";
import MobileDeviceAlert from "../components/header/MobileDeviceAlert";

const Home = () => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const { mainViewModel, setMainViewModel } = useAppContext();

  useEffect(() => {
    loadViewModel(mainViewModel);
    forceUpdate();

    const html = document.querySelector("html");
    if (html) html.style.overflow = "hidden";
  }, []);

  return (
    <Stack padding="1rem">
      <MobileDeviceAlert />
      <BasicInfo />
      <Divider />
      <PlannerComponent />
    </Stack>
  );
};

export default Home;

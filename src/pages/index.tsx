import { Stack, Divider, useDisclosure } from "@chakra-ui/react";
import { useState, useCallback, useEffect, SetStateAction } from "react";
import PlannerComponent from "../components/Planner";
import { loadViewModel } from "../utils/plannerUtils";
import BasicInfo from "../components/BasicInfo";
import { useAppContext } from "../components/AppContext";
import { isMobile } from "react-device-detect";
import MobileDeviceAlert from "../components/MobileDeviceAlert";

const Home = () => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const { mainViewModel, setMainViewModel } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadViewModel(mainViewModel);
    forceUpdate();
    if (isMobile) {
      onOpen();
    }
  }, []);

  return (
    <Stack padding="1rem">
      <MobileDeviceAlert isOpen={isOpen} onClose={onClose} />
      <BasicInfo />
      <Divider />
      <PlannerComponent />
    </Stack>
  );
};

export default Home;

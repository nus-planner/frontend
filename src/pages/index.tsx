import { Stack, Divider } from "@chakra-ui/react";
import { useState, useCallback, useEffect, SetStateAction } from "react";
import PlannerComponent from "../components/Planner";
import { loadViewModel } from "../utils/plannerUtils";
import BasicInfo from "../components/BasicInfo";
import { useAppContext } from "../components/AppContext";
import MobileDeviceAlert from "../components/MobileDeviceAlert";

const Home = ({ isMobile }: { isMobile: boolean }) => {
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
      <MobileDeviceAlert isMobile={isMobile} />
      <BasicInfo />
      <Divider />
      <PlannerComponent />
    </Stack>
  );
};

export async function getServerSideProps(context: {
  req: { headers: { [x: string]: any } };
}) {
  const UA = context.req.headers["user-agent"];
  const isMobile = Boolean(
    UA.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
    ),
  );

  return {
    props: {
      isMobile: isMobile,
    },
  };
}

export default Home;

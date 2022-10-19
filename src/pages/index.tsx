import {
  Stack,
  Divider,
} from "@chakra-ui/react";
import { useState, useCallback, useEffect } from "react";
import PlannerComponent from "../components/Planner";
import * as models from "../models";
import BasicInfo from "../components/BasicInfo";

const Home = () => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);

  // TODO: Set up the following to change when corresponding plan is selected
  const [mainViewModel, setMainViewModel] = useState(
    new models.MainViewModel(2020, 4),
  );

  useEffect(() => {
    mainViewModel
      // .initializeFromString(reqStr)
      .initializeFromURL(
        "https://raw.githubusercontent.com/nus-planner/frontend/main/locals/requirements/cs-2019.json",
      )
      .then(forceUpdate);
  }, []);

  return (
    <Stack padding="1rem">
      <BasicInfo/>
      <div />
      <Divider />
      <PlannerComponent
        mainViewModel={mainViewModel}
        setMainViewModel={setMainViewModel}
      />
    </Stack>
  );
};

export default Home;

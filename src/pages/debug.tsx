import { Stack, Divider } from "@chakra-ui/react";
import PlannerComponent from "../components/Planner";
import BasicInfo from "../components/header/BasicInfo";

const Debug = () => {

  return (
    <Stack padding="1rem">
      <BasicInfo />
      <div />
      <Divider />
      <PlannerComponent />
    </Stack>
  );
};

export default Debug;

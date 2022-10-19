import {
  Heading,
  Select,
  HStack,
  Stack,
  Divider,
  FormControl,
} from "@chakra-ui/react";
import { useState, useCallback, useEffect, SetStateAction } from "react";
import {
  majors,
  specialisations,
} from "../constants/dummyModuleData";
import PlannerComponent from "../components/Planner";
import * as models from "../models";


const Home = () => {
  // Helper function to help refresh since react-beautiful-dnd can't detect some changes
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);


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
      <HStack spacing={"3rem"}>
        <Heading fontSize={"2xl"} fontWeight={"bold"} fontFamily={"body"}>
          NUS Planner
        </Heading>
        <FormControl w="-moz-fit-content">
          <Select
            placeholder="Choose your enrollment year"
            onChange={handleYearChange}
          >
            {years.map((year) => (
              <option key={year}>
                AY{year}/{year + 1}
              </option>
            ))}
          </Select>
        </FormControl>

        {year && (
          <FormControl w="-moz-fit-content">
            <Select
              placeholder="Choose your major"
              onChange={handleMajorChange}
            >
              {majors.map((major) => (
                <option key={major}>{major}</option>
              ))}
            </Select>
          </FormControl>
        )}

        {year && major && (
          <FormControl w="-moz-fit-content">
            <Select
              placeholder="Choose your focus area"
              onChange={handleSpecialisationChange}
            >
              {specialisations.map((specialisation) => (
                <option key={specialisation}>{specialisation}</option>
              ))}
            </Select>
          </FormControl>
        )}
      </HStack>

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

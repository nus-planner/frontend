import { Select, FormControl, HStack, Heading, Button } from "@chakra-ui/react";

import { majors, specialisations } from "../constants/dummyModuleData";
import { useState, SetStateAction, useCallback } from "react";
import { useAppContext } from "./AppContext";
import { labelModules } from "../utils/plannerUtils";
import { MainViewModel } from "../models";

type RequirementInfo = {
  year: number;
  major: string;
  url: string;
};

const hardcodeRequirementInfos: RequirementInfo[] = [
  {
    year: 2019,
    major: "Computer Science",
    url: "https://raw.githubusercontent.com/nus-planner/frontend/main/locals/requirements/2019/cs.json",
  },
  {
    year: 2020,
    major: "Electrical Engineering",
    url: "https://raw.githubusercontent.com/nus-planner/frontend/main/locals/requirements/2020/mech_eng.json",
  },
  {
    year: 2020,
    major: "Applied Math",
    url: "https://raw.githubusercontent.com/nus-planner/frontend/main/locals/requirements/2020/applied_math.json",
  },
  {
    year: 2022,
    major: "Economics",
    url: "https://raw.githubusercontent.com/nus-planner/frontend/main/locals/requirements/2022/chs_econs.json"
  }
];

const BasicInfo = () => {
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const { mainViewModel, setMainViewModel } = useAppContext();

  // Basic info of the user
  const years: number[] = [];
  const currYear = new Date().getFullYear();
  // Assume a student stays in NUS for at most 5 years
  for (let i = 0; i < 5; i++) {
    years.push(currYear - i);
  }

  const majorMap = new Map<number, RequirementInfo[]>();
  for (let year of years) {
    majorMap.set(year, []);
  }

  // Load hardcoded data
  for (let requirementInfo of hardcodeRequirementInfos) {
    majorMap.get(requirementInfo.year)?.push(requirementInfo);
  }

  console.log("Majormap");
  console.log(majorMap);

  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
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

  const loadRequirement = () => {
    const newModel = new MainViewModel(parseInt(year), 4);
    newModel
      .initializeFromURL(
        // "https://raw.githubusercontent.com/nus-planner/frontend/main/locals/requirements/cs-2019.json",
        majorMap.has(parseInt(year))
          ? (majorMap.get(parseInt(year)) as RequirementInfo[])[parseInt(major)]
              .url
          : "",
      )
      .then(() => {
        setMainViewModel(newModel);
        forceUpdate();
        const moduleArr = Array.from(mainViewModel.modulesMap.values());
        labelModules(moduleArr);
      });
  };

  return (
    <HStack spacing={"1rem"}>
      <Heading fontSize={"2xl"} fontWeight={"bold"} fontFamily={"body"}>
        NUS Planner
      </Heading>
      <FormControl w="-moz-fit-content">
        <Select
          placeholder="Choose your enrollment year"
          onChange={handleYearChange}
          value={year}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              AY{year}/{year + 1}
            </option>
          ))}
        </Select>
      </FormControl>

      {year && (
        <FormControl w="-moz-fit-content">
          <Select placeholder="Choose your major" onChange={handleMajorChange}>
            {(majorMap.get(parseInt(year)) ?? []).map((req, idx) => (
              <option key={idx} value={idx}>
                {req.major}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
      {major && (
        <Button
          size="sm"
          colorScheme={"white"}
          variant="outline"
          onClick={loadRequirement}
        >
          Load Requirement
        </Button>
      )}
    </HStack>
  );
};

export default BasicInfo;

import { Select, FormControl, HStack, Heading } from "@chakra-ui/react";

import { majors, specialisations } from "../constants/dummyModuleData";
import { useState, SetStateAction } from "react";

const BasicInfo = () => {
  // Basic info of the user
  const years: number[] = [];
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

  return (
    <HStack spacing={"1rem"}>
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
          <Select placeholder="Choose your major" onChange={handleMajorChange}>
            {majors.map((major) => (
              <option key={major}>{major}</option>
            ))}
          </Select>
        </FormControl>
      )}
    </HStack>
  );
};

export default BasicInfo;

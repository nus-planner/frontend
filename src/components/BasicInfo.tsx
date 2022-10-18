import {
  Select,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  HStack,
} from "@chakra-ui/react";

import { majors, specialisations } from "../constants/dummyModuleData";

import React, { useState} from "react";

const years = [1,2,3,4];
const currYear = new Date().getFullYear();

const BasicInfo = (currYear: number) => {
  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
  const [specialisation, setSpecialisation] = useState("");

  const handleYearChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setMajor(event.target.value);
  };

  const handleSpecialisationChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setSpecialisation(event.target.value);
  };

  return (
    <HStack>
      <FormControl w="-moz-fit-content">
        <Select placeholder="Choose your enrollment year" onChange={handleYearChange}>
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
  );
};

export default BasicInfo;

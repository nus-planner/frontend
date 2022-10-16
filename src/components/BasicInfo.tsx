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

const years = [];
const currYear = new Date().getFullYear();

// Assume a student stays in NUS for at most 5 years
for (let i = 0; i < 5; i++) {
  years.push(currYear - i);
}

const BasicInfo = (currYear) => {
  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
  const [specialisation, setSpecialisation] = useState("");

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMajorChange = (event) => {
    setMajor(event.target.value);
  };

  const handleSpecialisationChange = (event) => {
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

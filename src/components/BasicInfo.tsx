import {
  Select,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";

import { dummyModuleState } from "../constants/dummyModuleData";

const BasicInfo = () => {
  return (
    <FormControl>
      <FormLabel>Country</FormLabel>
      <Select placeholder="Select country">
        <option>United Arab Emirates</option>
        <option>Nigeria</option>
      </Select>
    </FormControl>
  );
};

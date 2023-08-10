import {
  Select,
  FormControl,
  HStack,
  Button,
  Spinner,
  Flex,
  IconButton,
  useDisclosure,
  Tooltip,
  Image,
  Box,
  Link,
} from "@chakra-ui/react";

import "reflect-metadata"; // needed for class-transformer https://github.com/typestack/class-transformer/issues/178
import { plainToInstance, Type } from "class-transformer";
import { useState, SetStateAction, useCallback, useEffect } from "react";
import { useAppContext } from "../AppContext";
import { labelModules, storeViewModel } from "../../utils/plannerUtils";
import { MainViewModel } from "../../models";
import { EmailIcon } from "@chakra-ui/icons";
import { BsTelegram } from "react-icons/bs";
import FeedbackModal from "./FeedbackModal";
import {
  COURSE_MAJOR,
  ENROLLMENT_YEAR,
  VIEWMODEL_STORAGE,
} from "../../constants/planner";
import LoadAlert from "./LoadAlert";

class DirectoryList {
  @Type(() => DirectoryListing)
  files: DirectoryListing[] = [];
}

class DirectoryListing {
  static requirementsBaseUrl = "/requirements/";
  static studyPlanBaseUrl = "/study_plans/";
  cohort!: number;
  faculty!: string;
  course!: string;
  filename!: string;
  hidden?: boolean;
  get url(): string {
    return `${DirectoryListing.requirementsBaseUrl}/${this.filename}`;
  }

  get planUrl(): string {
    return `${DirectoryListing.studyPlanBaseUrl}/${this.filename}`;
  }
}

const BasicInfo = () => {
  const [, updateState] = useState<{}>();
  const forceUpdate = useCallback(() => updateState({}), []);
  const { mainViewModel, setMainViewModel } = useAppContext();
  const [directoryList, setDirectoryList] = useState<DirectoryList>({
    files: [],
  });
  const [loadingSpinner, setLoadingSpinner] = useState(false);
  const {
    isOpen: isOpenLoadAlert,
    onOpen: onOpenLoadAlert,
    onClose: onCloseLoadAlert,
  } = useDisclosure();
  const {
    isOpen: isOpenFeedbackModal,
    onOpen: onOpenFeedbackModal,
    onClose: onCloseFeedbackModal,
  } = useDisclosure();

  useEffect(() => {
    fetch("/requirements/dir.json")
      .then((res) => res.json())
      .then((plain) => plainToInstance(DirectoryList, plain))
      .then((directoryList) => {
        directoryList.files.filtered(
          (file) => file.hidden === undefined || !file.hidden,
        );
        setDirectoryList(directoryList);
      });
    setYear(localStorage.getItem(ENROLLMENT_YEAR) || "");
    setMajor(localStorage.getItem(COURSE_MAJOR) || "");
  }, []);

  // Basic info of the user
  const years: number[] = [];
  const currYear = new Date().getFullYear();
  // Assume a student stays in NUS for at most 5 years
  for (let i = 0; i < 5; i++) {
    years.push(currYear - i);
  }

  const majorMap = new Map<number, DirectoryListing[]>();
  for (let year of years) {
    majorMap.set(year, []);
  }

  // Load hardcoded data
  for (let requirementInfo of directoryList.files) {
    majorMap.get(requirementInfo.cohort)?.push(requirementInfo);
  }

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
    setLoadingSpinner(true);
    localStorage.setItem(ENROLLMENT_YEAR, year);
    localStorage.setItem(COURSE_MAJOR, major);
    const listing = majorMap.get(parseInt(year))?.[parseInt(major)];
    const url = listing?.url ?? "";
    const sampleStudyPlanUrl = listing?.planUrl;
    const newModel = new MainViewModel(parseInt(year), 4, sampleStudyPlanUrl);
    newModel.initializeFromURL(url).then(() => {
      const moduleArr = Array.from(newModel.modulesMap.values());
      labelModules(moduleArr);
      for (let requirement of newModel.requirements) {
        requirement.modules = [...new Set(requirement.modules)].sort((a, b) =>
          a.code.localeCompare(b.code),
        );
      }

      setMainViewModel(newModel);
      forceUpdate();
      setLoadingSpinner(false);
      storeViewModel(newModel);
    });
  };

  return (
    <Flex w="full" h="full" align="center" justify="space-between">
      <HStack spacing={"1rem"}>
        {/* <Heading fontSize={"2xl"} fontWeight={"bold"} fontFamily={"body"}>
          NUS Planner
        </Heading> */}
        <Box w="13rem">
          <Image src="/logos/colorful_label_out.jpg" alt="NUS Planner" />
        </Box>
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
            <Select
              placeholder="Choose your major"
              onChange={handleMajorChange}
              value={major}
            >
              {(majorMap.get(parseInt(year)) ?? []).map((req, idx) => (
                <option key={idx} value={idx}>
                  {req.course}
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
            onClick={() => {
              if (localStorage.getItem(VIEWMODEL_STORAGE) === null) {
                loadRequirement();
              } else {
                onOpenLoadAlert();
              }
            }}
          >
            Load Requirement
          </Button>
        )}
        {loadingSpinner && <Spinner />}
        <LoadAlert
          onClose={onCloseLoadAlert}
          isOpen={isOpenLoadAlert}
          loadRequirement={loadRequirement}
        />
      </HStack>
      <HStack spacing={"1rem"} px="1rem">
        <Tooltip label="Join our Telegram group!">
          <Link href="https://t.me/+-lAnVtDL8z4xYmJl" isExternal>
            <IconButton
              aria-label="Open menu"
              fontSize="1.5rem"
              color="gray.600"
              variant="ghost"
              icon={<BsTelegram />}
            />
          </Link>
        </Tooltip>
        <Tooltip label="Submit Feedback">
          <IconButton
            aria-label="Open menu"
            fontSize="1.5rem"
            color="gray.600"
            variant="ghost"
            icon={<EmailIcon />}
            onClick={onOpenFeedbackModal}
          />
        </Tooltip>

        <FeedbackModal
          isOpen={isOpenFeedbackModal}
          onClose={onCloseFeedbackModal}
        />
      </HStack>
    </Flex>
  );
};

export default BasicInfo;

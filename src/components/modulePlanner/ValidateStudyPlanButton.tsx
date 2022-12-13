import {
  Button,
  ListItem,
  Text,
  Tooltip,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { MainViewModel } from "../../models";

interface ValidateStudyPlanButtonProps {
  mainViewModel: MainViewModel;
  isDisabled: boolean;
}

const ValidateStudyPlanButton = ({
  mainViewModel,
  isDisabled,
}: ValidateStudyPlanButtonProps) => {
  const toast = useToast();

  const validateViewModel = () => {
    const validationResult = mainViewModel.validate();
    if (validationResult) {
      toast({
        title: "Your study plan is valid",
        status: "success",
        duration: 3216,
        isClosable: true,
      });
      return;
    }

    const unfulfilledRequirements: string[] = [];

    const requirements = mainViewModel.requirements;
    requirements.forEach((requirement) => {
      if (!requirement.isFulfilled) {
        unfulfilledRequirements.push(requirement.title);
      }
    });

    toast({
      title: "Your study plan is invalid",
      description: (
        <>
          You did not fulfill the following requirements:
          <UnorderedList>
            {unfulfilledRequirements.map((requirement, idx) => (
              <ListItem key={idx}>{requirement}</ListItem>
            ))}
          </UnorderedList>
        </>
      ),
      status: "error",
      duration: 3216,
      isClosable: true,
    });
  };

  return (
    <Tooltip isDisabled={!isDisabled} label='You have not fulfilled some prerequisites'>
      <Button
        size="sm"
        colorScheme={"white"}
        variant="outline"
        onClick={validateViewModel}
        isDisabled={isDisabled}
      >
        Validate Study Plan
      </Button>
    </Tooltip>
  );
};

export default ValidateStudyPlanButton;

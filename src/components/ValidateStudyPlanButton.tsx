import {
  Button,
  ListItem,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { MainViewModel } from "../models";

interface ValidateStudyPlanButtonProps {
  mainViewModel: MainViewModel;
}

const ValidateStudyPlanButton = ({
  mainViewModel,
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
    <Button
      size="sm"
      colorScheme={"white"}
      variant="outline"
      onClick={validateViewModel}
    >
      Validate View Model
    </Button>
  );
};

export default ValidateStudyPlanButton;

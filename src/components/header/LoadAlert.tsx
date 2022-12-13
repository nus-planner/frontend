import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";

interface LoadAlertProps {
  isOpen: boolean;
  onClose: () => void;
  loadRequirement: () => void;
}
const LoadAlert = ({ isOpen, onClose, loadRequirement }: LoadAlertProps) => {
  const cancelRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Load Course Requirement
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure? All existing data will be lost.
          </AlertDialogBody>
          <AlertDialogBody>
            You can&apos;t undo this action afterwards.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              colorScheme="red"
              onClick={() => {
                loadRequirement();
                onClose();
              }}
              ml={3}
            >
              Load Requirement
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default LoadAlert;

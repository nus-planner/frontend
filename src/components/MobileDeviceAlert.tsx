import {
  useDisclosure,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { useRef } from "react";

interface MobileDeviceAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileDeviceAlert = ({ isOpen, onClose }: MobileDeviceAlertProps) => {
  const cancelRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader>
          This website is not designed to be used on Mobile.
        </AlertDialogHeader>
        <AlertDialogBody>
          Please access this website on desktop for the intended viewing
          experience.
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button onClick={onClose} width='100%'>Continue</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


export default MobileDeviceAlert;

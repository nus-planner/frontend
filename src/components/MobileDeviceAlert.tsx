import {
  useDisclosure,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";

const MobileDeviceAlert = () => {
  const cancelRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const { onOpen, onClose, isOpen } = useDisclosure();

  useEffect(() => {
    if (isMobile) onOpen();
  }, []);

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
          <Button onClick={onClose} width="100%">
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MobileDeviceAlert;

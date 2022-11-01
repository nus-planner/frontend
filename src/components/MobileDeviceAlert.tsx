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

const MobileDeviceAlert = ({ isMobile }: { isMobile: boolean }) => {
  const cancelRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const { isOpen, onClose } = useDisclosure({
    defaultIsOpen: isMobile,
  });

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

export async function getServerSideProps(context: {
  req: { headers: { [x: string]: any } };
}) {
  const UA = context.req.headers["user-agent"];
  const isMobile = Boolean(
    UA.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
    ),
  );

  return {
    props: {
      isMobile: isMobile,
    },
  };
}

export default MobileDeviceAlert;

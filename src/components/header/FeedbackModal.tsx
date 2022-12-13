import { useRef, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  ModalFooter,
  Button,
  Input,
  Textarea,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { postFeedback } from "../../api/feedbackAPI";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal = ({ isOpen, onClose }: FeedbackModalProps) => {
  const initialRef = useRef(null);
  const finalRef = useRef(null);
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);
  const toast = useToast();

  const submitFeedback = () => {
    if (feedback === "") {
      setIsError(true);
      return;
    }

    let feedbackMessage = "";
    if (name !== "") feedbackMessage += `Name: ${name}\n`;
    feedbackMessage += `Feedback: ${feedback}`;
    postFeedback(feedbackMessage);
    onClose();
    toast({
      title: 'Feedback Received',
      description: "Thank you for your feedback!",
      status: 'success',
      duration: 1500,
      isClosable: true,
    })
  };

  return (
    <Modal
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Share with us your feedback</ModalHeader>
        <ModalCloseButton />
        <ModalBody>What do you think of our app?</ModalBody>
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              ref={initialRef}
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl mt={4} minHeight="3em" isInvalid={isError}>
            <FormLabel>
              Feedback <span style={{ color: "red" }}>*</span>
            </FormLabel>
            <Textarea
              mt={1}
              rows={3}
              shadow="sm"
              focusBorderColor="brand.400"
              placeholder="Feedback"
              onChange={(e) => {
                setFeedback(e.target.value);
                setIsError(false);
              }}
            />
            {isError && (
              <FormErrorMessage>Feedback cannot be empty.</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={submitFeedback}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;

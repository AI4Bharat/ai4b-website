"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Textarea,
  useRadio,
  useRadioGroup,
  Box,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { ReactElement, ReactSVGElement, useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { API_URL } from "@/app/config";
import axios from "axios";

const thumbs: { [key: string]: ReactElement } = {
  true: <FaThumbsUp color="orange" size={25} />,
  false: <FaThumbsDown color="orange" size={25} />,
};

const submitFeedback = async (body: any) => {
  const response = await axios.post(`${API_URL}/feedback/`, body);
  if (response.status === 201) return true;
  else return false;
};

function RadioCard(props: any) {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "a4borange",
          color: "white",
          borderColor: "teal.600",
        }}
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  );
}

export default function Feedback({
  serviceId,
  task,
  modelInput,
  modelResponse,
}: {
  serviceId: string;
  task: string;
  modelInput: string;
  modelResponse: string;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [liked, setLiked] = useState("false");
  const [comment, setComment] = useState("");

  const options = ["true", "false"];

  const toast = useToast();

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "framework",
    defaultValue: liked,
    onChange: setLiked,
  });

  const group = getRootProps();

  return (
    <>
      <Button
        colorScheme="orange"
        textColor={"white"}
        variant="solid"
        boxShadow={"lg"}
        onClick={onOpen}
      >
        Submit Feedback
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Model Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Comment</FormLabel>
              <Textarea
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                }}
              />
              <FormHelperText>
                Provide your comment on the model's performance
              </FormHelperText>
              <br />
              <HStack {...group}>
                {options.map((value) => {
                  const radio = getRadioProps({ value });
                  return (
                    <RadioCard key={value} {...radio}>
                      {thumbs[value]}
                    </RadioCard>
                  );
                })}
              </HStack>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              variant={"solid"}
              color="a4borange"
              mr={3}
              isDisabled={comment === ""}
              onClick={async () => {
                const feedbackSubmitted = await submitFeedback({
                  comment: comment,
                  liked: liked,
                  task: task,
                  serviceId: serviceId,
                  modelInput: modelInput,
                  modelResponse: modelResponse,
                });
                if (feedbackSubmitted) {
                  toast({
                    title: "Success",
                    description: "Feedback Submitted",
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                  });
                } else {
                  toast({
                    title: "Error",
                    description: "Could not submit feedback",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                  });
                }
                setComment("");
                onClose();
              }}
            >
              Submit Feedback
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

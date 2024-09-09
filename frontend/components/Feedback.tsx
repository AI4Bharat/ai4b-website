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
} from "@chakra-ui/react";
import { ReactElement, ReactSVGElement, useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const thumbs: { [key: string]: ReactElement } = {
  true: <FaThumbsUp color="orange" size={25} />,
  false: <FaThumbsDown color="orange" size={25} />,
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

export default function Feedback() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [liked, setLiked] = useState("false");
  const [comment, setComment] = useState("");

  const options = ["true", "false"];

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
              onClick={() => {
                console.log({ comment: comment, liked: liked });
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

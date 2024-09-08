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
} from "@chakra-ui/react";

export default function Feedback() {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Amet
            asperiores rerum voluptate praesentium labore consequuntur a
            perspiciatis. Explicabo distinctio sint vel illum? Architecto
            doloribus vel placeat non quae et nesciunt.
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

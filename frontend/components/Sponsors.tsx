"use client";
import Image from "next/image";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  Card,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import {
  FcAbout,
  FcAssistant,
  FcCollaboration,
  FcDonate,
  FcManager,
} from "react-icons/fc";

export default function Sponsors() {
  return (
    <Box p={4}>
      <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
        <Heading
          fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
          fontWeight={"bold"}
        >
          Our Sponsors
        </Heading>
      </Stack>

      <Container maxW={"5xl"} mt={12}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Card w={300} h={100}>
            <Image src="/assets/logos/meity.svg" alt="LLM" fill={true} />
          </Card>
          <Card w={300} h={150}>
            <Image src="/assets/logos/C-DAC.png" alt="LLM" fill={true} />
          </Card>
          <Card w={300} h={100}>
            <Image src="/assets/logos/nilekani.png" alt="LLM" fill={true} />
          </Card>
          <Card w={300} h={100}>
            <Image src="/assets/logos/ekstep.png" alt="LLM" fill={true} />
          </Card>
          <Card w={300} h={100}>
            <Image src="/assets/logos/microsoft.png" alt="LLM" fill={true} />
          </Card>
          <Card w={300} h={100}>
            <Image src="/assets/logos/google.png" alt="LLM" fill={true} />
          </Card>
          <Card w={300} h={100}>
            <Image src="/assets/logos/yotta.png" alt="LLM" fill={true} />
          </Card>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

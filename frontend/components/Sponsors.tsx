"use client";
import { imagePrefix } from "@/app/config";
import {
  Box,
  Card,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Wrap,
} from "@chakra-ui/react";
import Image from "next/image";

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

      <Box mt={12}>
        <Wrap justify={"center"} gap={10}>
          <Card w={200} h={75}>
            <Image
              src={`${imagePrefix}/assets/logos/meity.svg`}
              alt="LLM"
              fill={true}
            />
          </Card>
          <Card w={200} h={75}>
            <Image
              src={`${imagePrefix}/assets/logos/nilekani.png`}
              alt="LLM"
              fill={true}
            />
          </Card>
          <Card w={200} h={75}>
            <Image
              src={`${imagePrefix}/assets/logos/ekstep.png`}
              alt="LLM"
              fill={true}
            />
          </Card>
          <Card w={200} h={75}>
            <Image
              src={`${imagePrefix}/assets/logos/C-DAC.png`}
              alt="LLM"
              fill={true}
            />
          </Card>
          <Card w={200} h={75}>
            <Image
              src={`${imagePrefix}/assets/logos/microsoft.png`}
              alt="LLM"
              fill={true}
            />
          </Card>
          <Card w={200} h={75}>
            <Image
              src={`${imagePrefix}/assets/logos/google.png`}
              alt="LLM"
              fill={true}
            />
          </Card>
          <Card w={200} h={75}>
            <Image
              src={`${imagePrefix}/assets/logos/yotta.png`}
              alt="LLM"
              fill={true}
            />
          </Card>
        </Wrap>
      </Box>
    </Box>
  );
}

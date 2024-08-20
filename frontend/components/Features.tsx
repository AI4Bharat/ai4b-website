"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import {
  FcAbout,
  FcAssistant,
  FcCollaboration,
  FcDonate,
  FcManager,
} from "react-icons/fc";

interface CardProps {
  heading: string;
  description: string;
  icon: ReactElement;
  href: string;
}

import Image from "next/image";

const Card = ({ heading, description, icon, href }: CardProps) => {
  return (
    <Box
      maxW={{ base: "full", md: "275px" }}
      w={"full"}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={5}
    >
      <Stack align={"start"} spacing={2}>
        <Flex
          w={16}
          h={16}
          align={"center"}
          justify={"center"}
          color={"white"}
          rounded={"full"}
          bg={useColorModeValue("gray.100", "gray.700")}
        >
          {icon}
        </Flex>
        <Box mt={2}>
          <Heading size="md">{heading}</Heading>
          <Text mt={1} fontSize={"sm"}>
            {description}
          </Text>
        </Box>
        <Button variant={"link"} colorScheme={"blue"} size={"sm"}>
          Learn more
        </Button>
      </Stack>
    </Box>
  );
};

export default function Features() {
  return (
    <Box p={4}>
      <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
        <Heading fontSize={{ base: "2xl", sm: "4xl" }} fontWeight={"bold"}>
          Cutting-edge work across areas.
        </Heading>
      </Stack>

      <Container maxW={"5xl"} mt={12}>
        <Flex flexWrap="wrap" gridGap={6} justify="center">
          <Card
            heading={"Large Language Models"}
            icon={
              <Image
                src="/assets/icons/llm.png"
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "AI4Bharat has pioneered the development of multilingual LLMs tailored for Indian languages, such as IndicBERT, IndicBART, and Airavata trained on extensive, diverse datasets like IndicCorpora and Sangraha."
            }
            href={"#"}
          />
          <Card
            heading={"Machine Translation"}
            icon={
              <Image
                src="/assets/icons/mt.png"
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "AI4Bharat has pioneered the development of multilingual LLMs tailored for Indian languages, such as IndicBERT, IndicBART, and Airavata trained on extensive, diverse datasets like IndicCorpora and Sangraha."
            }
            href={"#"}
          />
          <Card
            heading={"Transliteration"}
            icon={
              <Image
                src="/assets/icons/xlit.png"
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "AI4Bharat has pioneered the development of multilingual LLMs tailored for Indian languages, such as IndicBERT, IndicBART, and Airavata trained on extensive, diverse datasets like IndicCorpora and Sangraha."
            }
            href={"#"}
          />
          <Card
            heading={"Automatic Speech Recognition"}
            icon={
              <Image
                src="/assets/icons/asr.png"
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "AI4Bharat has pioneered the development of multilingual LLMs tailored for Indian languages, such as IndicBERT, IndicBART, and Airavata trained on extensive, diverse datasets like IndicCorpora and Sangraha."
            }
            href={"#"}
          />
          <Card
            heading={"Text to Speech"}
            icon={
              <Image
                src="/assets/icons/tts.png"
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "AI4Bharat has pioneered the development of multilingual LLMs tailored for Indian languages, such as IndicBERT, IndicBART, and Airavata trained on extensive, diverse datasets like IndicCorpora and Sangraha."
            }
            href={"#"}
          />
          <Card
            heading={"OCR"}
            icon={
              <Image
                src="/assets/icons/ocr.png"
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "AI4Bharat has pioneered the development of multilingual LLMs tailored for Indian languages, such as IndicBERT, IndicBART, and Airavata trained on extensive, diverse datasets like IndicCorpora and Sangraha."
            }
            href={"#"}
          />
        </Flex>
      </Container>
    </Box>
  );
}

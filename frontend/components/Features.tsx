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
  Link,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import { imagePrefix } from "@/app/config";

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
        <Link href={href}>
          <Button variant={"link"} colorScheme={"blue"} size={"sm"}>
            Learn more
          </Button>
        </Link>
      </Stack>
    </Box>
  );
};

export default function Features() {
  return (
    <Box p={4}>
      <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
        <Heading
          fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
          fontWeight={"bold"}
        >
          <Text textColor={"a4borange"}>Cutting-edge work</Text>
          <Text textColor={"a4bred"}>across areas.</Text>
        </Heading>
      </Stack>

      <Container maxW={"5xl"} mt={12}>
        <Flex flexWrap="wrap" gridGap={6} justify="center">
          <Card
            heading={"Large Language Models"}
            icon={
              <Image
                src={`${imagePrefix}/assets/icons/llm.png`}
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "AI4Bharat has pioneered the development of multilingual LLMs tailored for Indian languages, such as IndicBERT, IndicBART, and Airavata trained on extensive, diverse datasets like IndicCorpora and Sangraha."
            }
            href={`${imagePrefix}/areas/llm`}
          />
          <Card
            heading={"Machine Translation"}
            icon={
              <Image
                src={`${imagePrefix}/assets/icons/nmt.png`}
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "Our machine translation models, including IndicTransv2, are built on large-scale datasets mined from the web and carefully curated human translations, catering to all 22 Indian languages and competing with commercial models as validated on multiple benchmarks."
            }
            href={`${imagePrefix}/areas/nmt`}
          />
          <Card
            heading={"Transliteration"}
            icon={
              <Image
                src={`${imagePrefix}/assets/icons/xlit.png`}
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "AI4Bharat’s transliteration models, like IndicXlit, are optimized for converting text between scripts of Indian languages and English, leveraging large scale datasets such as Aksharantar"
            }
            href={`${imagePrefix}/areas/xlit`}
          />
          <Card
            heading={"Automatic Speech Recognition"}
            icon={
              <Image
                src={`${imagePrefix}/assets/icons/asr.png`}
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "Our ASR models, including IndicWav2Vec and IndicWhisper, are trained on rich datasets like Kathbath, Shrutilipi and IndicVoices, covering multiple Indian languages."
            }
            href={`${imagePrefix}/areas/asr`}
          />
          <Card
            heading={"Text to Speech"}
            icon={
              <Image
                src={`${imagePrefix}/assets/icons/tts.png`}
                alt="LLM"
                width={100}
                height={100}
              />
            }
            description={
              "AI4Bharat’s TTS efforts, exemplified by AI4BTTS, focus on creating natural-sounding synthetic voices for Indian languages using a mix of web-crawled data and carefully curated datasets like Rasa."
            }
            href={`${imagePrefix}/areas/tts`}
          />
          {/* <Card
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
          /> */}
        </Flex>
      </Container>
    </Box>
  );
}

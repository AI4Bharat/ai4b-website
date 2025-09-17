"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  SimpleGrid,
  LinkBox,
  LinkOverlay,
  Spacer,
} from "@chakra-ui/react";
import { ReactElement } from "react";
import { imagePrefix } from "@/app/config";
import Link from "next/link";

interface CardProps {
  heading: string;
  description: string;
  icon: ReactElement;
  href: string;
}

import Image from "next/image";
import AI4BContainer from "./AI4BContainer";

const Card = ({ heading, description, icon, href }: CardProps) => {
  return (
    <LinkBox
      maxW={{ base: "full", md: "275px" }}
      w={"full"}
      borderWidth="1px"
      borderRadius="lg"
      p={5}
      mx={"auto"}
    >
      <Stack spacing={2} h="100%">
        <Flex w="100%" justify="center" align="center">
          <Flex
            w={16}
            h={16}
            align={"center"}
            justify={"center"}
            color={"white"}
            rounded={"full"}
          >
            {icon}
          </Flex>
        </Flex>

        <Box mt={2} textAlign="left">
          <Heading size="md">{heading}</Heading>
          <Text mt={1} fontSize={"sm"}>
            {description}
          </Text>
        </Box>

        <Spacer />

        {href !== "" ? (
          <LinkOverlay as={Link} href={href}>
            <Button variant={"link"} colorScheme={"orange"}>
              Learn more
            </Button>
          </LinkOverlay>
        ) : (
          <Text textColor={"a4borange"}>Coming Soon</Text>
        )}
      </Stack>
    </LinkBox>
  );
};

export default function Features() {
  return (
    <AI4BContainer>
      <Heading
        fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
        fontWeight={"bold"}
        py={10}
      >
        <Text textColor={"a4borange"}>Cutting-edge work</Text>
        <Text textColor={"a4bred"}>across areas.</Text>
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={6}>
      
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
            "We pioneered multilingual ​LLMs like IndicBERT, ​IndicBART, and Airavata for ​Indian languages, trained on ​extensive diverse datasets ​like IndicCorpora and ​Sangraha."
          }
          href={`${imagePrefix}/areas/llm`}
        />
        <Card
          heading={"Machine Translation"}
          icon={
            <Image
              src={`${imagePrefix}/assets/icons/nmt.png`}
              alt="NMT"
              width={100}
              height={100}
            />
          }
          description={
            "Our machine translation ​models like IndicTransv2 ​cover 22 Indian languages, ​using web data and human ​translations to compete with ​commercial models on ​various benchmarks."
          }
          href={`${imagePrefix}/areas/nmt`}
        />
        <Card
          heading={"Transliteration"}
          icon={
            <Image
              src={`${imagePrefix}/assets/icons/xlit.png`}
              alt="XLIT"
              width={100}
              height={100}
            />
          }
          description={
            "AI4Bharat's transliteration ​models, like IndicXlit, are ​designed to convert text ​between Indian languages ​and English using datasets ​like Aksharantar."
          }
          href={`${imagePrefix}/areas/xlit`}
        />
        <Card
          heading={"Automatic Speech Recognition"}
          icon={
            <Image
              src={`${imagePrefix}/assets/icons/asr.png`}
              alt="ASR"
              width={100}
              height={100}
            />
          }
          description={
            "Our ASR models, including ​IndicWav2Vec and ​IndicWhisper, are trained on ​rich datasets like Kathbath, ​Shrutilipi and IndicVoices, ​covering multiple Indian ​languages."
          }
          href={`${imagePrefix}/areas/asr`}
        />
        <Card
          heading={"Text to Speech"}
          icon={
            <Image
              src={`${imagePrefix}/assets/icons/tts.png`}
              alt="TTS"
              width={100}
              height={100}
            />
          }
          description={
            "Our focus is on developing ​models that generate ​natural-sounding synthetic ​voices for Indian languages ​using web-crawled data and ​curated datasets like Rasa."
          }
          href={`${imagePrefix}/areas/tts`}
        />
        <Card
          heading={"Optical Character Recognition"}
          icon={
            <Image
              src={`${imagePrefix}/assets/icons/ocr.png`}
              alt="OCR"
              width={100}
              height={100}
            />
          }
          description={
            "We are in the early stages of ​developing models and ​datasets to advance ​Document Layout Parsing ​and OCR technologies for various Indian scripts."
          }
          href={""}
        />
      </SimpleGrid>
    </AI4BContainer>
  );
}

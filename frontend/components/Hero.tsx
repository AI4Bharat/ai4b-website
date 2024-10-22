"use client";

import {
  Container,
  Stack,
  Flex,
  Box,
  Heading,
  Text,
  Button,
  Image,
  Icon,
  IconButton,
  createIcon,
  IconProps,
  useColorModeValue,
  Divider,
  Wrap,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { imagePrefix } from "@/app/config";

import Features from "./Features";
import Datasets from "./Datasets";
import Sponsors from "./Sponsors";
import News from "./NewsSection";

export default function Hero() {
  return (
    <Container maxW={"7xl"}>
      <Stack
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}
        direction={{ base: "column", md: "row" }}
      >
        <Stack flex={1} spacing={{ base: 5, md: 10 }}>
          <HStack>
            <Image
              height={150}
              width={150}
              src={"/assets/logos/ai4bclogo.png"}
            />
            <Heading
              ml={5}
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
            >
              <Text as={"span"} color={"a4borange"} position={"relative"}>
                Building AI
              </Text>
              <br />
              <Text as={"span"} color={"a4bred"}>
                for India!
              </Text>
            </Heading>
          </HStack>
          <Text color={"black"}>
            AI4Bharat, a research lab at IIT Madras, is dedicated to advancing
            AI technology for Indian languages through open-source
            contributions. Over the past, the lab has developed and released a
            wide range of datasets, tools, and state-of-the-art models. The
            focus areas of the lab include transliteration, natural language
            understanding, generation, translation, automatic speech
            recognition, and speech synthesis. AI4Bharat’s work is recognized
            globally, with publications in top-tier conferences and deployments
            in real-world use cases, making a significant impact across
            academia, industry, and government sectors.
          </Text>
          <Wrap>
            <Button
              as="a"
              href={`${imagePrefix}/areas/xlit`}
              borderRadius={10}
              size={"lg"}
              fontWeight={"normal"}
              px={6}
              textColor={"white"}
              bg={"a4borange"}
              _hover={{ bg: "red.500" }}
            >
              XLIT
            </Button>
            <Button
              as="a"
              href={`${imagePrefix}/areas/nmt`}
              borderRadius={10}
              size={"lg"}
              fontWeight={"normal"}
              px={6}
              textColor={"white"}
              bg={"a4borange"}
              _hover={{ bg: "red.500" }}
            >
              NMT
            </Button>
            <Button
              as="a"
              href={`${imagePrefix}/areas/asr`}
              borderRadius={10}
              size={"lg"}
              fontWeight={"normal"}
              px={6}
              textColor={"white"}
              bg={"a4borange"}
              _hover={{ bg: "red.500" }}
            >
              ASR
            </Button>
            <Button
              as="a"
              href={`${imagePrefix}/areas/tts`}
              borderRadius={10}
              size={"lg"}
              fontWeight={"normal"}
              px={6}
              textColor={"white"}
              bg={"a4borange"}
              _hover={{ bg: "red.500" }}
            >
              TTS
            </Button>
            <Button
              as="a"
              href={`${imagePrefix}/areas/llm`}
              borderRadius={10}
              size={"lg"}
              fontWeight={"normal"}
              px={6}
              textColor={"white"}
              bg={"a4borange"}
              _hover={{ bg: "red.500" }}
            >
              LLMs
            </Button>
          </Wrap>
        </Stack>
        <Flex
          flex={1}
          justify={"center"}
          align={"center"}
          position={"relative"}
          w={"full"}
          height={"50vh"}
        >
          <Image
            alt={"Hero Image"}
            fit={"contain"}
            align={"center"}
            w={"100%"}
            h={"100%"}
            src={"/assets/wordcloudtransparent.png"}
          />
        </Flex>
      </Stack>
      <Divider colorScheme="orange" variant={"solid"} />
      {/* <News />  */}
      <Divider colorScheme="orange" variant={"solid"} />
      <Features />
      <Divider colorScheme="orange" variant={"solid"} />
      <Datasets />
      <Divider colorScheme="orange" variant={"solid"} />
      <Sponsors />
    </Container>
  );
}

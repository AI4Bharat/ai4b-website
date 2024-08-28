"use client";
import {
  chakra,
  Link,
  Stack,
  Box,
  Button,
  useColorModeValue,
  Container,
  Flex,
  Text,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import axios from "axios";
import { API_URL } from "@/app/config";
import { useEffect, useState } from "react";
import AreaTimeline from "../AreaTimeline";
import { title } from "process";

const areaInfo: { [key: string]: { title: string; description: string } } = {
  nmt: {
    title: "Machine Translation",
    description:
      "Our machine translation models, including IndicTransv2, are built on large-scale datasets mined from the web and carefully curated human translations, catering to all 22 Indian languages and competing with commercial models as validated on multiple benchmarks.",
  },
  llm: {
    title: "Large Language Models",
    description: `At AI4Bharat, our dedication to building language models and datasets for all 22 constitutionally
                    recognized Indian languages is central to our mission. We employ a multifaceted approach, leveraging
                    large-scale data crawling, synthetic data creation, and human annotation/crowd collections to create
                    comprehensive datasets. Our efforts have resulted in an extensive pretraining corpus of 251 million
                    tokens across 22 languages, complemented by 74.7 million prompt-response pairs in 20 Indian
                    languages. Tools like Setu play a crucial role in large-scale crawling and data cleaning, enabling
                    us to build state-of-the-art models such as Airavata, IndicBART, and IndicBERT. We also emphasize
                    rigorous evaluation of our models, as demonstrated by our works like FBI, IndicXTREME, IndicNLG, and
                    IndicGLUE, which set new benchmarks in language model performance. Looking ahead, we are committed
                    to expanding our pretraining corpora to support the development of even more robust generative
                    models, while ensuring diversity in their generation capabilities, thereby advancing the frontier of
                    language technology for India’s diverse linguistic landscape.`,
  },
  asr: {
    title: "Automatic Speech Recognition",
    description:
      "Our ASR models, including IndicWav2Vec and IndicWhisper, are trained on rich datasets like Kathbath, Shrutilipi and IndicVoices, covering multiple Indian languages.",
  },
  tts: {
    title: "Speech Synthesis",
    description:
      "AI4Bharat’s TTS efforts, exemplified by AI4BTTS, focus on creating natural-sounding synthetic voices for Indian languages using a mix of web-crawled data and carefully curated datasets like Rasa.",
  },
  xlit: {
    title: "Transliteration",
    description:
      "AI4Bharat’s transliteration models, like IndicXlit, are optimized for converting text between scripts of Indian languages and English, leveraging large scale datasets such as Aksharantar",
  },
};

const fetchAreaData = async (slug: string) => {
  try {
    const response = await axios.get(`${API_URL}/area/${slug}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching filterOptions:", error);
    return [];
  }
};

export default function AreaComponent({ slug }: { slug: string }) {
  const [areaData, setAreaData] = useState([]);

  const { data, isLoading, error } = useQuery("fetchAreaData", () =>
    fetchAreaData(slug.toUpperCase())
  );

  useEffect(() => {
    if (!isLoading && !error) {
      setAreaData(data);
    }
    console.log(data);
  }, [data, isLoading, error]);

  return (
    <Container maxW={"7xl"}>
      {areaInfo[slug] ? (
        <Stack
          align={"center"}
          spacing={{ base: 4, md: 5 }}
          py={{ base: 10, md: 18 }}
          direction={{ base: "column", md: "row" }}
        >
          <Stack flex={1} spacing={{ base: 5, md: 10 }}>
            <Heading
              lineHeight={1.1}
              fontWeight={600}
              fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
            >
              <Text as={"span"} position={"relative"}>
                {areaInfo[slug].title}
              </Text>
            </Heading>
            <Text textColor={"a4borange"}>
              To know more about our contributions over the years see the
              timeline below!
            </Text>
          </Stack>
          <Flex
            flex={1}
            justify={"center"}
            align={"center"}
            position={"relative"}
            w={"full"}
          >
            <Box
              position={"relative"}
              rounded={"2xl"}
              boxShadow={"2xl"}
              width={"full"}
              overflow={"hidden"}
              bg="a4borange"
              p={5}
            >
              <Text textColor={"white"}>{areaInfo[slug].description}</Text>
            </Box>
          </Flex>
        </Stack>
      ) : (
        <></>
      )}
      <VStack>
        {areaInfo[slug] ? <AreaTimeline data={areaData} /> : <></>}
      </VStack>
    </Container>
  );
}

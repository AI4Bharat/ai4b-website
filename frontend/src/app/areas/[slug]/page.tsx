"use client";
import { useParams } from "next/navigation";
import {
  chakra,
  Link,
  Stack,
  Box,
  Button,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import axios from "axios";
import { API_URL } from "@/app/config";
import { useEffect, useState } from "react";
import AreaTimeline from "../../../../components/AreaTimeline";
import { title } from "process";

const areaInfo = {
  nmt: {
    title: "Machine Translation",
    description:
      "AI4Bharat is a pioneering initiative focused on building open-source AI solutions that address challenges unique to India. One of their significant contributions is in the field of machine translation, where they aim to bridge the linguistic diversity of the country. AI4Bharat has developed state-of-the-art models that facilitate the translation of text between Indian languages, enabling seamless communication across different linguistic communities. Their work includes creating large-scale datasets, fine-tuning models for regional languages, and ensuring these tools are accessible to developers and researchers. This initiative not only promotes inclusivity but also helps preserve the rich linguistic heritage of India by making digital content available in multiple languages.",
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

export default function Areas() {
  const params = useParams();
  const slug = params.slug as keyof typeof areaInfo;
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
    <Box pb={8}>
      <Stack
        pos="relative"
        bgGradient="linear(to-l, #ff944d,#ff6600)"
        height="250px"
        w="100%"
      ></Stack>
      <Box
        maxW="3xl"
        p={4}
        isolation="isolate"
        zIndex={3}
        mt="-10rem"
        marginInline="auto"
      >
        <Box
          boxShadow={useColorModeValue(
            "0 4px 6px rgba(160, 174, 192, 0.6)",
            "0 4px 6px rgba(9, 17, 28, 0.9)"
          )}
          bg={useColorModeValue("white", "gray.800")}
          p={{ base: 4, sm: 8 }}
          overflow="hidden"
          rounded="2xl"
        >
          {areaInfo[slug] ? (
            <Stack
              pos="relative"
              zIndex={1}
              direction="column"
              spacing={5}
              textAlign="left"
            >
              <chakra.h1 fontSize="4xl" lineHeight={1.2} fontWeight="bold">
                {areaInfo[slug].title}
              </chakra.h1>
              <chakra.h1
                color="gray.400"
                fontSize="xl"
                maxW="600px"
                lineHeight={1.2}
              >
                {areaInfo[slug].description}
              </chakra.h1>
            </Stack>
          ) : (
            <></>
          )}
        </Box>
      </Box>
      {areaInfo[slug] ? <AreaTimeline data={areaData} /> : <></>}
    </Box>
  );
}

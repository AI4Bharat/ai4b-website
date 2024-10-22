"use client";
import {
  chakra,
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
import Link from "next/link";
import { imagePrefix } from "@/app/config";

const areaInfo: { [key: string]: { title: string; description: string } } = {
  nmt: {
    title: "Machine Translation",
    description: `At AI4Bharat, we have made significant strides in Machine Translation for Indic languages. Our Samanantar corpus, the largest publicly available parallel dataset, includes 49.7 million sentence pairs between English and 11 Indic languages, with 37.4 million pairs newly mined. This corpus has been instrumental in training multilingual NMT models that outperform existing benchmarks.

We developed IndicTrans, a Transformer-based multilingual NMT model trained on Samanantar, and IndicTrans2, the first open-source model supporting high-quality translations across all 22 scheduled Indic languages. IndicTrans2 integrates multiple scripts and employs script unification to enhance transfer learning.

Additionally, we introduced the Bharat Parallel Corpus Collection (BPCC), which includes approximately 230 million bitext pairs for all 22 scheduled Indic languages. BPCC features BPCC-Mined with 228 million pairs and BPCC-Human with 2.2 million gold-standard pairs, expanding the dataset and providing new resources for 7 Indic languages. These contributions significantly advance the field of Machine Translation for Indic languages.`,
  },
  llm: {
    title: "Large Language Models",
    description: `At AI4Bharat, our dedication to building language models and datasets for all 22 constitutionally
                    recognized Indian languages is central to our mission. We employ a multifaceted approach, leveraging
                    large-scale data crawling, synthetic data creation, and human annotation/crowd collections to create
                    comprehensive datasets. Our efforts have resulted in an extensive pretraining corpus of 251 billion
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
      "At AI4Bharat, our commitment to Automatic Speech Recognition (ASR) is driven by a vision of embracing and reflecting India's rich linguistic and cultural diversity. We are dedicated to creating inclusive ASR systems that span all 22 constitutionally recognized languages. Our approach combines cutting-edge engineering techniques for large-scale data crawling with meticulous ground-level data collection across over 400 districts, resulting in a dataset of unprecedented magnitude. This includes 300,000 hours of raw speech, 6,000 hours of transcribed data, and 6,400 hours of mined audio-text pairs, augmented by pseudo-labeled data from diverse sources like YouTube. This extensive dataset empowers us to address the complexities of India's linguistic landscape effectively. Our focus on building robust benchmarks is exemplified by our work with Vistaar, IndicSUPERB, Lahaja, and Svarah, which have set new standards in ASR evaluation. Our state-of-the-art models include IndicWav2Vec, IndicWhisper, and IndicConformer, with our latest model supporting all 22 languages and demonstrating our commitment to technological excellence. Moving forward, we aim to enhance our models to handle 8KZ telephony data, adapt them for specific domains and demographics through synthetic data generation, and ensure their functionality in offline settings, further advancing the frontiers of ASR technology for low-resource languages.",
  },
  tts: {
    title: "Speech Synthesis",
    description: `At AI4Bharat, we are advancing text-to-speech (TTS) technology for Indian languages. We’ve evaluated TTS models for Dravidian and Indo-Aryan languages, finding that FastPitch and HiFi-GAN V1 outperform existing systems. Our open-source models and datasets, including Rasa—the first multilingual expressive TTS dataset for Assamese, Bengali, and Tamil—show significant improvements in expressiveness and practical solutions for resource constraints.

To address out-of-vocabulary (OOV) issues in low-resource languages like Hindi and Tamil, we propose a cost-effective strategy using volunteer-recorded data to enhance OOV performance without compromising quality. We also restored the largest multilingual Indian TTS dataset, featuring 1,704 hours of high-quality speech from 10,496 speakers across 22 languages. These efforts are pivotal for advancing TTS technology in India's diverse linguistic landscape.`,
  },
  xlit: {
    title: "Transliteration",
    description: `At AI4Bharat, we are advancing transliteration and language identification to embrace India's linguistic diversity across 22 constitutionally recognized languages. We introduce Aksharantar, the largest publicly available transliteration dataset for Indian languages, containing 26 million transliteration pairs across 21 languages and 12 scripts. This dataset is 21 times larger than existing resources and is the first to cover 7 languages and 1 language family. Alongside Aksharantar, we also introduce the Aksharantar testset, which includes 103,000 word pairs, enabling fine-grained evaluation of transliteration models. Using this dataset, we developed IndicXlit, a multilingual transliteration model that enhances accuracy by 15% on established benchmarks.

In the realm of language identification, we created Bhasha-Abhijnaanam, a comprehensive LID test set for native-script and romanized text, spanning all 22 Indic languages. IndicLID, our language identifier, is designed for both native and romanized scripts, supporting 47 classes, including English and Others. IndicLID sets a new standard for language identification in romanized Indian text, overcoming challenges like limited training data and similar language structures. These resources are publicly available to drive further innovation in Indic language transliteration and identification.`,
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
  const [latest, setLatest] = useState("");

  const { data, isLoading, error } = useQuery("fetchAreaData", () =>
    fetchAreaData(slug.toUpperCase())
  );

  useEffect(() => {
    if (!isLoading && !error) {
      setAreaData(data);
      data.forEach((element: any) => {
        if (element.latest) {
          setLatest(element.title);
          console.log(element.title);
        }
      });
    }
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
            {latest !== "" ? (
              <Link
                href={`${imagePrefix}/areas/model/${slug.toUpperCase()}/${latest}`}
              >
                <Button
                  borderRadius={10}
                  size={"lg"}
                  fontWeight={"normal"}
                  px={6}
                  textColor={"white"}
                  bg={"a4borange"}
                  _hover={{ bg: "red.500" }}
                >
                  Try Out the Latest Model
                </Button>
              </Link>
            ) : (
              <></>
            )}
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

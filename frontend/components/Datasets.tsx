"use client";
import { ReactElement, useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  Icon,
  Text,
  Stack,
  Flex,
  Heading,
  Container,
  Card,
  CardBody,
  useColorModeValue,
  SkeletonCircle,
  SkeletonText,
  Link,
  Image as ChakraImage,
} from "@chakra-ui/react";
import Image from "next/image";
import axios from "axios";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import { imagePrefix } from "@/app/config";
import { FaFileAudio, FaFileAlt } from "react-icons/fa";

const datasetIcons: { [key: string]: React.ReactElement } = {
  nmt: <FaFileAlt color="orange" size={25} />,
  llm: <FaFileAlt color="orange" size={25} />,
  asr: <FaFileAudio color="orange" size={25} />,
  tts: <FaFileAudio color="orange" size={25} />,
  xlit: <FaFileAlt color="orange" size={25} />,
};

interface FeatureProps {
  title: string;
  icon: string;
}

interface Dataset {
  website_link: string | undefined;
  title: string;
  area: string;
}

// const datasets: { [key: string]: { path: string; icon: string } } = {
//   Sangraha: { path: "", icon: "/assets/icons/llm.png" },
//   Samanantar: { path: "", icon: "/assets/icons/nmt.png" },
//   BPCC: { path: "", icon: "/assets/icons/nmt.png" },
//   Shrutilipi: { path: "", icon: "/assets/icons/asr.png" },
//   Svarah: { path: "", icon: "/assets/icons/asr.png" },
//   Lahaja: { path: "", icon: "/assets/icons/asr.png" },
//   IndicVoices: { path: "", icon: "/assets/icons/asr.png" },
//   Rasa: { path: "", icon: "/assets/icons/tts.png" },
//   Aksharantar: { path: "", icon: "/assets/icons/xlit.png" },
// };

const Feature = ({ title, icon }: FeatureProps) => {
  return (
    <Stack>
      <Flex
        w={16}
        h={16}
        align={"center"}
        justify={"center"}
        color={"white"}
        rounded={"full"}
        bg={"gray.100"}
        mb={1}
      >
        {datasetIcons[icon]}
      </Flex>
      <Text fontWeight={600}>{title}</Text>
    </Stack>
  );
};

const fetchDatasets = async () => {
  try {
    const response = await axios.get(`${API_URL}/datasets/`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching datasets:", error);
    return [];
  }
};

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const { isLoading, error, data } = useQuery("fetchDatasets", fetchDatasets);

  useEffect(() => {
    if (error || isLoading) {
      setDatasets([]);
    } else {
      setDatasets(data);
    }
  }, [error, data, isLoading]);

  return (
    <Container maxW={"7xl"}>
      <Stack
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}
        direction={{ base: "column", md: "row" }}
      >
        <Stack flex={1} spacing={{ base: 5, md: 10 }}>
          <Heading
            lineHeight={1.1}
            fontWeight={600}
            fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
          >
            <Text as={"span"} color={"a4borange"} position={"relative"}>
              Pioneering
            </Text>
            <br />
            <Text as={"span"} color={"a4bred"}>
              Data Collection!
            </Text>
          </Heading>
          <Flex
            flex={2}
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
            >
              <ChakraImage
                alt={"Hero Image"}
                src={`${imagePrefix}/assets/data-collection.png`}
              />
            </Box>
          </Flex>
          <Text>
            Early on in our journey, we recognized that advancing Indian
            technology necessitates large-scale datasets. Thus, building and
            collecting extensive datasets across multiple verticals has become a
            critical endeavor at AI4Bharat. Thanks to generous grants from
            MeitY, we are spearheading pioneering efforts in data collection as
            part of the Data Management Unit of Bhashini. Our nationwide
            initiative aims to gather 15,000 hours of transcribed data from over
            400 districts, encompassing all 22 scheduled languages of India. In
            parallel, our in-house team of over 100 translators is diligently
            creating a parallel corpus with 2.2 million translation pairs across
            22 languages. To produce studio-quality data for expressive TTS
            systems, we have established recording studios in our lab, where
            professional voice artists contribute their expertise. Additionally,
            our annotators are meticulously labeling pages for Document Layout
            Parsing, accommodating the diverse scripts of India. To accelerate
            the development of Indic Large Language Models (LLMs), we are
            focused on building pipelines for curating and synthetically
            generating pre-training data, collecting contextually grounded
            prompts, and creating evaluation datasets that reflect India’s rich
            linguistic tapestry. Collecting and annotating data at this scale
            demands standardization of processes and tools. To meet this
            challenge, AI4Bharat has invested in developing various open-source
            data collection and annotation tools, aiming to enhance these
            efforts not only within India but also in multilingual regions
            across the globe.
          </Text>
        </Stack>
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {Array.from({ length: 1 }, (_, index) => (
              <Card
                key={index}
                border={"solid"}
                borderColor={"orange"}
                w={113.77}
                h={140}
                padding="6"
              >
                <SkeletonCircle />
                <br />
                <SkeletonText />
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            {datasets.map((dataset: Dataset) => (
              <Card key={dataset.title} border={"solid"} borderColor={"orange"}>
                <CardBody>
                  <Feature
                    icon={dataset.area.toLowerCase()}
                    title={dataset.title}
                  />
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}

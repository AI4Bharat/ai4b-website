"use client";
import { ReactElement, useState, useEffect } from "react";
import {
  Box,
  Text,
  Stack,
  Flex,
  Heading,
  Card,
  HStack,
  Link,
  Image as ChakraImage,
  useBreakpointValue,
  Wrap,
  Divider,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tooltip,
} from "@chakra-ui/react";
import Image from "next/image";
import axios from "axios";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import { imagePrefix } from "@/app/config";
import DataCollectionCarousel from "./DataCollectionCarousel";
import {
  FaFileAudio,
  FaFileAlt,
  FaMicrophone,
  FaVolumeUp,
  FaLanguage,
  FaKeyboard,
} from "react-icons/fa";
import AI4BContainer from "./AI4BContainer";

const datasetIcons: { [key: string]: React.ReactElement } = {
  llm: <FaFileAlt color="#ff6600" size={50} />,
  asr: <FaMicrophone color="#ff6600" size={50} />,
  nmt: <FaLanguage color="#ff6600" size={50} />,
  tts: <FaVolumeUp color="#ff6600" size={50} />,
  xlit: <FaKeyboard color="#ff6600" size={50} />,
};

interface FeatureProps {
  title: string;
  icon: string;
  dataset_link: string;
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

const Feature = ({ title, icon, dataset_link }: FeatureProps) => {
  return (
    <HStack minWidth={150} p={3} as={Link} href={dataset_link}>
      <Text fontWeight={600}>{title}</Text>
    </HStack>
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
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const { isLoading, error, data } = useQuery("fetchDatasets", fetchDatasets);

  useEffect(() => {
    if (error || isLoading) {
      setDatasets([]);
    } else {
      setDatasets(data);
    }
  }, [error, data, isLoading]);

  return (
    <AI4BContainer>
      <DataCollectionCarousel />

      <Flex direction={{ base: "column", md: "row" }} gap={6}>
        <Box flex={1}>
          <Heading
            lineHeight={1.1}
            fontWeight={600}
            fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
            py={5}
          >
            <Text as={"span"} color={"a4borange"} position={"relative"}>
              Pioneering
            </Text>
            <br />
            <Text as={"span"} color={"a4bred"}>
              Data Collection!
            </Text>
          </Heading>

          <Text color={"black"}>
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
        </Box>
      </Flex>

      <Text
        fontSize={"2xl"}
        fontWeight={600}
        textAlign={"center"}
        color={"a4borange"}
        mt={10}
        mb={5}
      >
        Explore Datasets
      </Text>

      <Stack
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        px={10}
        direction={{ base: "column", md: "row" }}
      >
        <Tabs>
          <TabList>
            <Tab>
                <Tooltip
                  label="Automatic Speech Recognition"
                  aria-label="Automatic Speech Recognition"
                >
              <HStack>
                <FaMicrophone color="#ff6600" size={25} />
                  <Text as="b">ASR</Text>
              </HStack>
              </Tooltip>
            </Tab>
            <Tab>
                <Tooltip
                  label="Large Language Models"
                  aria-label="Large Language Models"
                >
              <HStack>
                <FaFileAlt color="#ff6600" size={25} />
                  <Text as="b">LLMs</Text>
              </HStack>
              </Tooltip>
            </Tab>
            <Tab>
                <Tooltip
                  label="Neural Machine Translation"
                  aria-label="Neural Machine Translation"
                >
              <HStack>
                <FaLanguage color="#ff6600" size={25} />
                  <Text as="b">NMT</Text>
              </HStack>
              </Tooltip>
            </Tab>
            <Tab>
            <Tooltip label="Text-To-Speech" aria-label="Text-To-Speech">
              <HStack>
                <FaVolumeUp color="#ff6600" size={25} />

                  <Text as="b">TTS</Text>
              </HStack>
              </Tooltip>
            </Tab>
            <Tab>
            <Tooltip label="Transliteration" aria-label="Transliteration">
              <HStack>
                <FaKeyboard color="#ff6600" size={25} />
                  <Text as="b">XLIT</Text>
              </HStack>
              </Tooltip>
            </Tab>
          </TabList>

          <TabPanels>
            {/* ASR Tab Panel */}
            <TabPanel>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : (
                Object.entries(datasetIcons).map(([key, val]) =>
                  key === "asr" ? (
                    <>
                      <HStack>
                        {val}
                        <Wrap ml={5} key={key}>
                          {datasets.map((dataset) => (
                            <>
                              {dataset.area.toLowerCase() === key ? (
                                <Card
                                  key={dataset.title}
                                  border={"solid"}
                                  borderColor={"a4borange"}
                                >
                                  <Feature
                                    icon={dataset.area.toLowerCase()}
                                    title={dataset.title}
                                    dataset_link={
                                      dataset.website_link
                                        ? dataset.website_link
                                        : ""
                                    }
                                  />
                                </Card>
                              ) : null}
                            </>
                          ))}
                        </Wrap>
                      </HStack>
                      <Divider borderWidth={1} borderColor={"gray.100"} />
                    </>
                  ) : null
                )
              )}
            </TabPanel>

            {/* LLM Tab Panel */}
            <TabPanel>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : (
                Object.entries(datasetIcons).map(([key, val]) =>
                  key === "llm" ? (
                    <>
                      <HStack>
                        {val}
                        <Wrap ml={5} key={key}>
                          {datasets.map((dataset) => (
                            <>
                              {dataset.area.toLowerCase() === key ? (
                                <Card
                                  key={dataset.title}
                                  border={"solid"}
                                  borderColor={"a4borange"}
                                >
                                  <Feature
                                    icon={dataset.area.toLowerCase()}
                                    title={dataset.title}
                                    dataset_link={
                                      dataset.website_link
                                        ? dataset.website_link
                                        : ""
                                    }
                                  />
                                </Card>
                              ) : null}
                            </>
                          ))}
                        </Wrap>
                      </HStack>
                      <Divider borderWidth={1} borderColor={"gray.100"} />
                    </>
                  ) : null
                )
              )}
            </TabPanel>

            {/* NMT Tab Panel */}

            <TabPanel>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : (
                Object.entries(datasetIcons).map(([key, val]) =>
                  key === "nmt" ? (
                    <>
                      <HStack>
                        {val}
                        <Wrap ml={5} key={key}>
                          {datasets.map((dataset) => (
                            <>
                              {dataset.area.toLowerCase() === key ? (
                                <Card
                                  key={dataset.title}
                                  border={"solid"}
                                  borderColor={"a4borange"}
                                >
                                  <Feature
                                    icon={dataset.area.toLowerCase()}
                                    title={dataset.title}
                                    dataset_link={
                                      dataset.website_link
                                        ? dataset.website_link
                                        : ""
                                    }
                                  />
                                </Card>
                              ) : null}
                            </>
                          ))}
                        </Wrap>
                      </HStack>
                      <Divider borderWidth={1} borderColor={"gray.100"} />
                    </>
                  ) : null
                )
              )}
            </TabPanel>

            {/* TTS Tab Panel */}
            <TabPanel>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : (
                Object.entries(datasetIcons).map(([key, val]) =>
                  key === "tts" ? (
                    <>
                      <HStack>
                        {val}
                        <Wrap ml={5} key={key}>
                          {datasets.map((dataset) => (
                            <>
                              {dataset.area.toLowerCase() === key ? (
                                <Card
                                  key={dataset.title}
                                  border={"solid"}
                                  borderColor={"a4borange"}
                                >
                                  <Feature
                                    icon={dataset.area.toLowerCase()}
                                    title={dataset.title}
                                    dataset_link={
                                      dataset.website_link
                                        ? dataset.website_link
                                        : ""
                                    }
                                  />
                                </Card>
                              ) : null}
                            </>
                          ))}
                        </Wrap>
                      </HStack>
                      <Divider borderWidth={1} borderColor={"gray.100"} />
                    </>
                  ) : null
                )
              )}
            </TabPanel>

            {/* XLIT Tab Panel */}
            <TabPanel>
              {isLoading ? (
                <Text>Loading...</Text>
              ) : (
                Object.entries(datasetIcons).map(([key, val]) =>
                  key === "xlit" ? (
                    <>
                      <HStack>
                        {val}
                        <Wrap ml={5} key={key}>
                          {datasets.map((dataset) => (
                            <>
                              {dataset.area.toLowerCase() === key ? (
                                <Card
                                  key={dataset.title}
                                  border={"solid"}
                                  borderColor={"a4borange"}
                                >
                                  <Feature
                                    icon={dataset.area.toLowerCase()}
                                    title={dataset.title}
                                    dataset_link={
                                      dataset.website_link
                                        ? dataset.website_link
                                        : ""
                                    }
                                  />
                                </Card>
                              ) : null}
                            </>
                          ))}
                        </Wrap>
                      </HStack>
                      <Divider borderWidth={1} borderColor={"gray.100"} />
                    </>
                  ) : null
                )
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </AI4BContainer>
  );
}

//TODO: Redesign datasets with tabs for each area

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
} from "@chakra-ui/react";
import Image from "next/image";
import axios from "axios";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import { imagePrefix } from "@/app/config";

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
        <Image src={icon} alt="Icon" width={50} height={50} />
      </Flex>
      <Text fontWeight={600}>{title}</Text>
    </Stack>
  );
};

const fetchDatasets = async () => {
  try {
    const response = await axios.get(`${API_URL}/datasets/`, {
      headers: {
        "ngrok-skip-browser-warning": true,
      },
    });
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
              height={"300px"}
              rounded={"2xl"}
              boxShadow={"2xl"}
              width={"full"}
              overflow={"hidden"}
            >
              <Image
                alt={"Hero Image"}
                fill
                src={`${imagePrefix}/assets/data-collection.png`}
              />
            </Box>
          </Flex>
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
              <Card
                as={Link}
                target="_blank"
                key={dataset.title}
                border={"solid"}
                borderColor={"orange"}
                href={dataset.website_link}
              >
                <CardBody>
                  <Feature
                    icon={`${imagePrefix}/assets/icons/${dataset.area.toLowerCase()}.png`}
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

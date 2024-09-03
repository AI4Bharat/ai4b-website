"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  chakra,
  Container,
  Text,
  HStack,
  VStack,
  Flex,
  Link,
  Select,
  useColorModeValue,
  Button,
  Stack,
  useBreakpointValue,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import { FaPaperclip, FaGithub, FaCode } from "react-icons/fa";
import { useQuery } from "react-query";
import axios from "axios";
import { API_URL } from "../config";
import Image from "next/image";
import { imagePrefix } from "../config";

const ExpandableText = ({
  text,
  noOfLines = 2,
}: {
  text: string;
  noOfLines: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => setIsExpanded(!isExpanded);

  return (
    <Box onClick={handleToggle} cursor="pointer">
      <Text fontSize={13} noOfLines={isExpanded ? undefined : noOfLines}>
        {text}
      </Text>
      <Text textColor="a4borange" mt={1}>
        {isExpanded ? "Show less" : "Read more"}
      </Text>
    </Box>
  );
};

const fetchPubFilters = async () => {
  try {
    const response = await axios.get(`${API_URL}/pubfilters/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching filterOptions:", error);
    return [];
  }
};

const fetchPublications = async () => {
  try {
    const response = await axios.get(`${API_URL}/publications/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching publications:", error);
    return [];
  }
};

interface Publication {
  title: string;
  description: string;
  area: string;
  conference: string;
  published_on: string;
  colab_link: string;
  hf_id: string;
  paper_link: string;
  github_link: string;
  type: string;
}

const Publications = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [filters, setFilters] = useState({
    areas: [],
    conferences: [],
    years: [],
  });

  const [publications, setPublications] = useState<Array<Publication>>([]);
  const [filteredPublications, setFilteredPublications] = useState<
    Publication[]
  >([]);

  const [filterArea, setFilterArea] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterConference, setFilterConference] = useState("All");

  const {
    data: filterData,
    isLoading: filterLoading,
    error: filterError,
  } = useQuery("fetchFilters", fetchPubFilters);
  const {
    data: pubData,
    isLoading: pubLoading,
    error: pubError,
  } = useQuery("fetchPublications", fetchPublications);

  useEffect(() => {
    if (!filterLoading && !filterError) {
      setFilters(filterData);
    }

    if (!pubLoading && !pubError) {
      setPublications(pubData);
      setFilteredPublications(pubData);
    }
  }, [filterLoading, filterError, filterData, pubLoading, pubError, pubData]);

  useEffect(() => {
    const filtered = publications.filter((pub) => {
      const matchesArea = filterArea === "All" || pub.area === filterArea;
      const matchesConference =
        filterConference === "All" || pub.conference === filterConference;
      const matchesYear =
        filterYear === "All" ||
        new Date(pub.published_on).getFullYear().toString() === filterYear;
      return matchesArea && matchesConference && matchesYear;
    });

    setFilteredPublications(filtered);
  }, [filterArea, filterYear, filterConference, publications]);

  return (
    <Box p={5}>
      <chakra.h3 fontSize="4xl" fontWeight="bold" mb={18} textAlign="center">
        Publications
      </chakra.h3>
      <Stack>
        <HStack p={3}>
          <Text fontSize={"lg"} as="b">
            Area:{" "}
          </Text>
          {filters.areas.map((area) => (
            <Button
              minWidth={"max-content"}
              p={2}
              value={area}
              onClick={(event) =>
                setFilterArea((event.target as HTMLInputElement).value)
              }
              colorScheme="orange"
              key={area}
            >
              {area}
            </Button>
          ))}
        </HStack>
        <HStack>
          <Text fontSize={"lg"} as="b">
            Conference:{" "}
          </Text>
          <SimpleGrid gap={3} columns={[2, 5, 6, 7]}>
            {filters.conferences.map((conference) => (
              <Button
                minWidth={"max-content"}
                p={2}
                value={conference}
                onClick={(event) =>
                  setFilterConference((event.target as HTMLInputElement).value)
                }
                colorScheme="orange"
                key={conference}
              >
                {conference}
              </Button>
            ))}
          </SimpleGrid>
        </HStack>
        <HStack p={3}>
          <Text fontSize={"lg"} as="b">
            Year:{" "}
          </Text>
          {filters.years.map((year) => (
            <Button
              minWidth={"max-content"}
              p={2}
              value={year}
              onClick={(event) =>
                setFilterYear((event.target as HTMLInputElement).value)
              }
              colorScheme="orange"
              key={year}
            >
              {year}
            </Button>
          ))}
        </HStack>
        <Button
          width={"fit-content"}
          color={"a4borange"}
          onClick={() => {
            setFilterArea("All");
            setFilterConference("All");
            setFilterYear("All");
          }}
        >
          Reset Filters
        </Button>
      </Stack>
      <Divider m={5} />
      <br />
      <Container height={isMobile ? 500 : "auto"} overflowY={"scroll"}>
        {filteredPublications.map((pub, index) => (
          <Flex key={index} mb="10px">
            <LineWithDot />
            <Card
              title={pub.title}
              categories={[pub.area, pub.conference]}
              description={pub.description}
              date={new Date(pub.published_on).toDateString()}
              hf_id={pub.hf_id}
              paper_link={pub.paper_link}
              github_link={pub.github_link}
              colab_link={pub.colab_link}
              type={pub.type}
            />
          </Flex>
        ))}
      </Container>
    </Box>
  );
};

interface CardProps {
  title: string;
  categories: string[];
  description: string;
  date: string;
  hf_id: string;
  paper_link: string;
  github_link: string;
  colab_link: string;
  type: string;
}

const Card = ({
  title,
  categories,
  description,
  date,
  hf_id,
  paper_link,
  github_link,
  colab_link,
  type,
}: CardProps) => {
  return (
    <HStack
      p={{ base: 3, sm: 6 }}
      bg={useColorModeValue("gray.100", "gray.800")}
      spacing={5}
      rounded="lg"
      alignItems="center"
      pos="relative"
      _before={{
        content: `""`,
        w: "0",
        h: "0",
        borderColor: `transparent ${useColorModeValue(
          "#edf2f6",
          "#1a202c"
        )} transparent`,
        borderStyle: "solid",
        borderWidth: "15px 15px 15px 0",
        position: "absolute",
        left: "-15px",
        display: "block",
      }}
    >
      <Box>
        <HStack spacing={2} mb={1}>
          {categories.map((cat) => (
            <Text fontSize="sm" key={cat}>
              {cat}
            </Text>
          ))}
        </HStack>
        <VStack spacing={2} mb={3} textAlign="left">
          <chakra.h1
            as={Link}
            _hover={{ color: "teal.400" }}
            fontSize="2xl"
            lineHeight={1.2}
            fontWeight="bold"
            w="100%"
          >
            {title}
          </chakra.h1>
          <ExpandableText noOfLines={2} text={description} />
          <HStack>
            {github_link ? (
              <Link target="_blank" href={github_link}>
                <FaGithub size={50} />
              </Link>
            ) : (
              <></>
            )}
            {colab_link ? (
              <Link target="_blank" href={colab_link}>
                <FaCode size={50} />
              </Link>
            ) : (
              <></>
            )}
            <Link target="_blank" href={paper_link}>
              <FaPaperclip size={50} />
            </Link>
            {hf_id === null ? (
              <></>
            ) : (
              <Link
                target="_blank"
                href={
                  type === "Model"
                    ? `https://huggingface.co/${hf_id}`
                    : `https://huggingface.co/datasets/${hf_id}`
                }
              >
                <img
                  src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
                  alt="Hugging Face"
                  style={{ width: "50px", height: "50px" }}
                />
              </Link>
            )}
          </HStack>
        </VStack>
        <Text fontSize="sm">{date}</Text>
      </Box>
    </HStack>
  );
};

const LineWithDot = () => {
  return (
    <Flex pos="relative" alignItems="center" mr="40px">
      <chakra.span
        position="absolute"
        left="50%"
        height="calc(100% + 10px)"
        border="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        top="0px"
      ></chakra.span>
      <Box pos="relative" p="10px">
        <Box
          pos="absolute"
          width="100%"
          height="100%"
          bottom="0"
          right="0"
          top="0"
          left="0"
          backgroundSize="cover"
          backgroundRepeat="no-repeat"
          backgroundPosition="center center"
          backgroundColor="rgb(255, 255, 255)"
          borderRadius="100px"
          border="3px solid rgb(255, 102, 0)"
          backgroundImage="none"
          opacity={1}
        ></Box>
      </Box>
    </Flex>
  );
};

export default Publications;

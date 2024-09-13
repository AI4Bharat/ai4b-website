"use client";
import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { ReactElement } from "react";
import {
  FcAbout,
  FcAssistant,
  FcCollaboration,
  FcDonate,
  FcManager,
} from "react-icons/fc";

import Link from "next/link";

import { datasets } from "@/app/datasets/config";

import axios from "axios";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";

const fetchDatasets = async () => {
  try {
    const response = await axios.get(`${API_URL}/datasets/`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching datasets:", error);
    return [];
  }
};

interface CardProps {
  heading: string;
  href: string;
}

function capitalizeFirstLetter(word: string) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const Card = ({ heading, href }: CardProps) => {
  return (
    <Box
      maxW={{ base: "full", md: "275px" }}
      w={"full"}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      borderColor={"a4borange"}
      p={5}
    >
      <Stack align={"start"} spacing={2}>
        <Box mt={2}>
          <Heading size="md">{heading}</Heading>
        </Box>
        <Link href={href}>
          <Button variant={"link"} textColor={"a4borange"} size={"sm"}>
            Learn more
          </Button>
        </Link>
      </Stack>
    </Box>
  );
};

export default function DatasetsList() {
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
    <Box p={4}>
      <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
        <Heading fontSize={{ base: "2xl", sm: "4xl" }} fontWeight={"bold"}>
          Datasets
        </Heading>
        <Text color={"gray.600"} fontSize={{ base: "sm", sm: "lg" }}>
          Browse through the different datasets that we have built at AI4Bharat
        </Text>
      </Stack>

      <Container maxW={"5xl"} mt={12}>
        <Flex flexWrap="wrap" gridGap={6} justify="center">
          {datasets.map((dataset: any) => (
            <Card
              key={dataset.title}
              heading={capitalizeFirstLetter(dataset.title)}
              href={dataset.website_link || ""}
            />
          ))}
        </Flex>
      </Container>
    </Box>
  );
}

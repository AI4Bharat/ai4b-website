"use client";
import React from "react";
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
  Link,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import { useEffect, useState } from "react";
import axios from "axios";
import NMT from "./TryOut/NMT";

const fetchModel = async ({ title }: { title: string }) => {
  try {
    const response = await axios.get(`${API_URL}/models/${title}/`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching model:", error);
    return [];
  }
};

export default function ModelView({ slug }: { slug: Array<string> }) {
  const [model, setModel] = useState<{
    paper_link: string | undefined;
    github_link: string | undefined;
    title: string;
    description?: string;
  }>({ title: "", description: "", github_link: "", paper_link: "" });

  const [hfData, setHFData] = useState({});

  const {
    isLoading: modelLoading,
    error: modelError,
    data: modelData,
  } = useQuery(["fetchModel", slug], () => fetchModel({ title: slug[1] }));

  useEffect(() => {
    if (modelError || modelLoading) {
      setModel({ title: "", description: "", github_link: "", paper_link: "" });
    } else {
      setModel(modelData);
    }
  }, [modelError, modelLoading, modelData]);

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
            <Text textColor={"a4borange"} as={"span"} position={"relative"}>
              {model.title}
            </Text>
          </Heading>
          <Text color={"gray.500"}>{model.description}</Text>
          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={{ base: "column", sm: "row" }}
          >
            <Button
              as={Link}
              href={model.github_link}
              rounded={"full"}
              size={"lg"}
              fontWeight={"normal"}
              px={6}
              colorScheme={"red"}
              bg={"red.400"}
              _hover={{ bg: "red.500" }}
            >
              Codebase
            </Button>
            <Button
              as={Link}
              href={model.paper_link}
              rounded={"full"}
              size={"lg"}
              fontWeight={"normal"}
              px={6}
              colorScheme={"red"}
              bg={"red.400"}
              _hover={{ bg: "red.500" }}
            >
              Paper
            </Button>
          </Stack>
        </Stack>
        <Flex
          flex={1}
          justify={"center"}
          align={"center"}
          position={"relative"}
          w={"full"}
        >
          <NMT />
        </Flex>
      </Stack>
    </Container>
  );
}

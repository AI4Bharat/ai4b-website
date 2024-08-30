"use client";
import React from "react";
import {
  Container,
  Stack,
  Flex,
  Box,
  Heading,
  Text,
  Link,
  HStack,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import { useEffect, useState } from "react";
import axios from "axios";
import NMT from "./TryOut/NMT";
import ASR from "./TryOut/ASR";
import XLIT from "./TryOut/XLIT";
import { FaPaperclip, FaGithub } from "react-icons/fa";

const fetchModel = async ({ title }: { title: string }) => {
  try {
    const response = await axios.get(`${API_URL}/models/${title}/`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching model:", error);
    return [];
  }
};

interface Model {
  service_id: string;
  inferenceSchema: any;
  languageFilters: any;
  hfData: any;
  conference: string;
  paper_link: string | undefined;
  github_link: string | undefined;
  title: string;
  description?: string;
}

const renderTryOut = ({ area, model }: { area: string; model: Model }) => {
  switch (area) {
    case "NMT":
      return (
        <NMT
          sourceLanguages={model.languageFilters.sourceLanguages}
          targetLanguages={model.languageFilters.targetLanguages}
          serviceId={model.service_id}
        />
      );
    case "ASR":
      return (
        <ASR
          sourceLanguages={model.languageFilters.sourceLanguages}
          serviceId={model.service_id}
        />
      );
    case "XLIT":
      return <XLIT sourceLanguages={model.languageFilters.sourceLanguages} />;
  }
};

export default function ModelView({
  area,
  title,
}: {
  area: string;
  title: string;
}) {
  const [model, setModel] = useState<{
    service_id: string;
    inferenceSchema: any;
    languageFilters: any;
    hfData: any;
    conference: string;
    paper_link: string | undefined;
    github_link: string | undefined;
    title: string;
    description?: string;
  }>({
    title: "",
    description: "",
    github_link: "",
    paper_link: "",
    conference: "",
    hfData: {},
    inferenceSchema: {},
    languageFilters: {},
    service_id: "",
  });

  const {
    isLoading: modelLoading,
    error: modelError,
    data: modelData,
  } = useQuery(["fetchModel", title], () => fetchModel({ title: title }));

  useEffect(() => {
    if (modelError || modelLoading) {
      setModel({
        title: "",
        description: "",
        github_link: "",
        paper_link: "",
        conference: "",
        hfData: {},
        inferenceSchema: {},
        languageFilters: {},
        service_id: "",
      });
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
          <HStack>
            {model.conference ? (
              <Box
                borderRadius={15}
                p={1}
                borderWidth={3}
                borderColor={"a4borange"}
              >
                <Text textColor={"a4borange"}>
                  Conference : {model.conference}
                </Text>
              </Box>
            ) : (
              <></>
            )}
            {model.hfData.downloads ? (
              <Box
                borderRadius={15}
                p={1}
                borderWidth={3}
                borderColor={"a4borange"}
              >
                <Text textColor={"a4borange"}>
                  Downloads : {model.hfData.downloads}
                </Text>
              </Box>
            ) : (
              <></>
            )}
          </HStack>
          <Text color={"gray.500"}>{model.description}</Text>
          <HStack>
            {model.github_link ? (
              <Box
                borderRadius={50}
                p={1}
                borderWidth={3}
                borderColor={"black"}
              >
                <Link target="_blank" href={model.github_link}>
                  <HStack>
                    <FaGithub size={25} />
                    <Text>Github</Text>
                  </HStack>
                </Link>
              </Box>
            ) : (
              <></>
            )}
            {model.paper_link ? (
              <Box
                borderRadius={50}
                p={1}
                borderWidth={3}
                borderColor={"black"}
              >
                <Link target="_blank" href={model.paper_link}>
                  <HStack>
                    <FaPaperclip size={25} />
                    <Text>Paper</Text>
                  </HStack>
                </Link>
              </Box>
            ) : (
              <></>
            )}
          </HStack>
        </Stack>
        {model.service_id ? (
          <Flex
            flex={1}
            justify={"center"}
            align={"center"}
            position={"relative"}
            w={"full"}
          >
            {modelLoading ? <></> : renderTryOut({ area: area, model: model })}
          </Flex>
        ) : (
          <></>
        )}
      </Stack>
    </Container>
  );
}

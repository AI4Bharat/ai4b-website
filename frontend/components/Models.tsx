"use client";
import { API_URL } from "@/app/config";
import {
  Box,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaCode, FaGithub, FaPaperclip } from "react-icons/fa";
import { useQuery } from "react-query";
import ToolInstructions from "./ToolInstructionComponent";
import ASR from "./TryOut/ASR";
import NMT from "./TryOut/NMT";
import TTS from "./TryOut/TTS";
import XLIT from "./TryOut/XLIT";
import Feedback from "./Feedback";

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
  services: any;
  installation_steps_json: Array<any>;
  usage_steps_json: Array<any>;
  type: string;
  hf_id: string;
}

const renderTryOut = ({ area, services }: { area: string; services: any }) => {
  switch (area) {
    case "NMT":
      return <NMT services={services} />;
    case "ASR":
      return <ASR services={services} />;
    case "XLIT":
      return <XLIT services={services} />;
    case "TTS":
      return <TTS services={services} />;
  }
};

export default function ModelView({
  area,
  title,
}: {
  area: string;
  title: string;
}) {
  const toast = useToast();

  const [model, setModel] = useState<{
    service_id: string;
    inferenceSchema: any;
    languageFilters: any;
    hfData: any;
    conference: string;
    paper_link: string | undefined;
    github_link: string | undefined;
    colab_link: string | undefined;
    title: string;
    description?: string;
    services: any;
    installation_steps_json: Array<any>;
    usage_steps_json: Array<any>;
    type: string;
    hf_id: string;
  }>({
    title: "",
    description: "",
    github_link: "",
    paper_link: "",
    colab_link: "",
    conference: "",
    hfData: null,
    inferenceSchema: {},
    languageFilters: {},
    service_id: "",
    services: {},
    installation_steps_json: [],
    usage_steps_json: [],
    type: "",
    hf_id: "",
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
        colab_link: "",
        conference: "",
        hfData: null,
        inferenceSchema: {},
        languageFilters: {},
        service_id: "",
        services: {},
        installation_steps_json: [],
        usage_steps_json: [],
        type: "",
        hf_id: "",
      });
    } else {
      setModel(modelData);
      if (
        modelData.services[Object.keys(modelData.services)[0]][
          "languageFilters"
        ]["sourceLanguages"].length === 0
      ) {
        toast({
          title: "Warning",
          description: "The Inference Service might not be available now",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
      }
    }
  }, [modelError, modelLoading, modelData]);

  return (
    <Container paddingLeft={20} maxW={"7xl"}>
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
            {model.hfData !== null ? (
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
            {model.colab_link ? (
              <Box
                borderRadius={50}
                p={1}
                borderWidth={3}
                borderColor={"black"}
              >
                <Link target="_blank" href={model.colab_link}>
                  <HStack>
                    <FaCode size={25} />
                    <Text>Colab</Text>
                  </HStack>
                </Link>
              </Box>
            ) : (
              <></>
            )}
            {model.hf_id ? (
              <Link
                target="_blank"
                href={
                  model.type === "Model"
                    ? `https://huggingface.co/${model.hf_id}`
                    : `https://huggingface.co/datasets/${model.hf_id}`
                }
              >
                <HStack
                  borderRadius={50}
                  p={1}
                  borderWidth={3}
                  borderColor={"black"}
                  width={"max-content"}
                >
                  <img
                    src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
                    alt="Hugging Face"
                    style={{ width: "25px", height: "25px" }}
                  />
                  <Text>Huggingface</Text>
                </HStack>
              </Link>
            ) : (
              <></>
            )}
          </HStack>
        </Stack>
        <VStack>
          {model.service_id ? (
            <Flex
              flex={1}
              justify={"center"}
              align={"center"}
              position={"relative"}
              w={"full"}
            >
              {modelLoading ? (
                <></>
              ) : (
                renderTryOut({ area: area, services: model.services })
              )}
            </Flex>
          ) : (
            <></>
          )}
        </VStack>
      </Stack>
      {modelLoading ? (
        <></>
      ) : (
        <>
          {model.installation_steps_json === null ? (
            <></>
          ) : (
            <ToolInstructions
              title="Installation"
              steps={model.installation_steps_json}
            />
          )}
        </>
      )}
      <Divider m={3} />
      {modelLoading ? (
        <></>
      ) : (
        <>
          {model.usage_steps_json === null ? (
            <></>
          ) : (
            <ToolInstructions title="Usage" steps={model.usage_steps_json} />
          )}
        </>
      )}
      <br />
    </Container>
  );
}

"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Container,
  Stack,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  chakra,
  Card,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import axios from "axios";
import { useEffect, useState } from "react";

import ReactPlayer from "react-player/youtube";

import Timeline from "../ToolTimelineComponent";
import ToolInstructions from "../ToolInstructionComponent";

interface Release {
  version: string;
  release_date: string;
  features_list: Array<string>;
}

interface Instruction {
  instruction: string;
  codeString: string;
  type: string;
}

interface Tool {
  title: string;
  description: string;
  main_video_hyperlink: string;
  hyperlink_buttons_json: Array<{ hyperlink: string; button_name: string }>;
  feature_cards_json: Array<{ title: string; description: string }>;
  release_timeline_json: Array<Release>;
  installation_steps_json: Array<Instruction>;
}

const fetchTool = async (slug: string) => {
  try {
    const response = await axios.get(`${API_URL}/tools/${slug}/`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching tool:", error);
    return [];
  }
};

export default function ToolComponent({ slug }: { slug: string }) {
  const [tool, setTool] = useState<Tool>({
    title: "",
    description: "",
    main_video_hyperlink: "",
    hyperlink_buttons_json: [],
    feature_cards_json: [],
    release_timeline_json: [],
    installation_steps_json: [],
  });
  const { isLoading, error, data } = useQuery(["fetchTool", slug], () =>
    fetchTool(Array.isArray(slug) ? slug[0] : slug)
  );

  useEffect(() => {
    if (error || isLoading) {
      setTool({
        title: "",
        description: "",
        main_video_hyperlink: "",
        hyperlink_buttons_json: [],
        feature_cards_json: [],
        release_timeline_json: [],
        installation_steps_json: [],
      });
    } else {
      setTool(data);
    }
  }, [error, data, isLoading]);

  return (
    <Container maxW={"7xl"}>
      <Stack
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 10, md: 18 }}
        direction={{ base: "column", md: "row" }}
      >
        <Stack flex={1} spacing={7}>
          <Heading
            lineHeight={1.1}
            fontWeight={600}
            fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
          >
            <Text as={"span"} position={"relative"}>
              {tool.title}
            </Text>
          </Heading>
          <Text color={"gray.500"}>{tool.description}</Text>
          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={{ base: "column", sm: "row" }}
          >
            {tool.hyperlink_buttons_json.map((button) => (
              <Link href={button.hyperlink}>
                <Button
                  rounded={"full"}
                  size={"lg"}
                  fontWeight={"normal"}
                  px={6}
                  colorScheme={"red"}
                  bg={"red.400"}
                  _hover={{ bg: "red.500" }}
                >
                  {button.button_name}
                </Button>
              </Link>
            ))}
          </Stack>
        </Stack>
        <Flex
          flex={1}
          justify={"center"}
          align={"center"}
          position={"relative"}
          w={"full"}
        >
          {tool.main_video_hyperlink === "" ? (
            <></>
          ) : (
            <ReactPlayer
              style={{ borderRadius: 50 }}
              url={tool.main_video_hyperlink}
              controls
            />
          )}
        </Flex>
      </Stack>
      <Container maxW="6xl" p={{ base: 5, md: 10 }}>
        <chakra.h3 fontSize="4xl" fontWeight="bold" mb={3} textAlign="center">
          Features
        </chakra.h3>
        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          placeItems="center"
          spacing={16}
          mt={12}
          mb={4}
        >
          {tool.feature_cards_json.map((feature, index) => (
            <Card padding={5} key={index} textAlign="center">
              <chakra.h3 fontWeight="semibold" fontSize="2xl">
                {feature.title}
              </chakra.h3>
              <Text fontSize="md">{feature.description}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
      <Timeline release_timeline_json={tool.release_timeline_json} />
      {/* <ToolInstructions steps={tool.installation_steps_json} /> */}
      {tool.installation_steps_json !== null ? (
        <Stack
          p={{ base: 5, md: 10 }}
          direction={{ base: "column", md: "row" }}
          backgroundSize="480px"
          backgroundPosition="center right"
          backgroundRepeat="no-repeat"
          minH={{ base: "unset", md: "450px" }}
        >
          <ToolInstructions
            title={"Installation"}
            steps={tool.installation_steps_json}
          />
        </Stack>
      ) : (
        <></>
      )}
    </Container>
  );
}

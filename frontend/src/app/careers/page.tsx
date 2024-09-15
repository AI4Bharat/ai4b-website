"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ReactElement, useEffect } from "react";
import CareerContactBanner from "../../../components/CareerContactBanner";
import Jobs from "../../../components/CareerJobList";

interface CardProps {
  heading: string;
  description: string;
  icon: ReactElement;
  href: string;
}

const Card = ({ heading, description, icon, href }: CardProps) => {
  return (
    <Box
      maxW={{ base: "full", md: "275px" }}
      w={"full"}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={5}
    >
      <Stack align={"start"} spacing={2}>
        <Flex
          w={16}
          h={16}
          align={"center"}
          justify={"center"}
          color={"white"}
          rounded={"full"}
          bg={useColorModeValue("gray.100", "gray.700")}
        >
          {icon}
        </Flex>
        <Box mt={2}>
          <Heading size="md">{heading}</Heading>
          <Text mt={1} fontSize={"sm"}>
            {description}
          </Text>
        </Box>
        <Button variant={"link"} colorScheme={"blue"} size={"sm"}>
          Learn more
        </Button>
      </Stack>
    </Box>
  );
};

export default function Careers() {
  useEffect(() => {
    // Dynamically update the page title and meta description
    document.title = "Careers at AI4Bharat - Join Our Team";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Explore exciting career opportunities at AI4Bharat. Join us to build cutting-edge AI solutions for Indian languages and contribute to India's AI future."
      );
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content =
        "Explore exciting career opportunities at AI4Bharat. Join us to build cutting-edge AI solutions for Indian languages and contribute to India's AI future.";
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <Box p={4}>
      <CareerContactBanner />

      <Container maxW={"5xl"} mt={12}>
        <Jobs />
      </Container>
    </Box>
  );
}

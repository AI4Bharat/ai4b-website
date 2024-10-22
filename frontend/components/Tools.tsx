"use client";
import {
  Container,
  Box,
  chakra,
  Text,
  SimpleGrid,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import axios from "axios";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Link as ChakraLink } from "@chakra-ui/react";
import { imagePrefix } from "@/app/config";

const Link = ({
  href,
  as,
  passHref = true,
  children,
  ...rest
}: {
  href: Object;
  as?: string;
  passHref?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <NextLink href={href} as={as} passHref={passHref}>
      <ChakraLink textColor={"a4borange"} {...rest}>
        {children}
      </ChakraLink>
    </NextLink>
  );
};

interface Tool {
  title: string;
  description: string;
}

const fetchTools = async () => {
  try {
    const response = await axios.get(`${API_URL}/tools/`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching tools:", error);
    return [];
  }
};

const ToolsList = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const { isLoading, error, data } = useQuery("fetchTools", fetchTools);

  useEffect(() => {
    if (error || isLoading) {
      setTools([]);
    } else {
      setTools(data);
    }
  }, [error, data, isLoading]);

  return (
    <Container maxW="6xl" p={{ base: 5, md: 10 }}>
      <chakra.h3 fontSize="4xl" fontWeight="bold" mb={20} textAlign="center">
        Check out our tools that are powered through Indic AI!
      </chakra.h3>
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 3 }}
        placeItems="center"
        spacing={10}
        mb={4}
      >
        {tools.map((tool, index) => (
          <Box
            key={index}
            bg={useColorModeValue("gray.100", "gray.700")}
            p={6}
            height={300}
            rounded="lg"
            textAlign="center"
            pos="relative"
          >
            <chakra.h3 fontWeight="semibold" fontSize="2xl" mt={6}>
              {tool.title}
            </chakra.h3>
            <Text noOfLines={5}>{tool.description}</Text>
            <br />
            <Link href={`${imagePrefix}/tools/${tool.title}`}>
              Learn more →
            </Link>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default ToolsList;

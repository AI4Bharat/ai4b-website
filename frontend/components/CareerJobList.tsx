/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { Fragment, ReactElement } from "react";
import {
  Container,
  Box,
  chakra,
  Flex,
  Stack,
  VStack,
  HStack,
  Grid,
  Icon,
  Divider,
  Link,
  useColorModeValue,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";
// Here we have used react-icons package for the icons
import { IconType } from "react-icons";
import { FaRegComment, FaRegHeart, FaRegEye } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "@/app/config";
interface JobAttributes {
  title: string;
  link: string;
  created_at: string;
}


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

const Jobs = () => {
  const [jobs, setJobs] = useState<JobAttributes[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${API_URL}/careers/`, {});
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching members:", error);
        setJobs([]);
      }
    };

    fetchMembers();
  }, []);

  return (
    <Container maxW="5xl" p={{ base: 5, md: 10 }}>
      <Flex justifyContent="left" mb={3}>
        <chakra.h3 fontSize="2xl" fontWeight="bold" textAlign="center">
          Available Roles
        </chakra.h3>
      </Flex>
      <VStack
        border="1px solid"
        borderColor="gray.400"
        rounded="md"
        overflow="hidden"
        spacing={0}
      >
        {jobs.map((job, index) => (
          <Fragment key={index}>
            <Grid
              templateRows={{ base: "auto auto", md: "auto" }}
              w="100%"
              templateColumns={{ base: "unset", md: "4fr 2fr 2fr" }}
              p={{ base: 2, sm: 4 }}
              gap={3}
              alignItems="center"
              _hover={{ bg: useColorModeValue("gray.200", "gray.700") }}
            >
              <Box gridColumnEnd={{ base: "span 2", md: "unset" }}>
                <chakra.h3
                  as={Link}
                  href={job.link}
                  isExternal
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {job.title}
                </chakra.h3>
                <chakra.p
                  fontWeight="medium"
                  fontSize="sm"
                  color={useColorModeValue("gray.600", "gray.300")}
                >
                  Posted On: {job.created_at}
                </chakra.p>
              </Box>
            </Grid>
            {jobs.length - 1 !== index && <Divider m={0} />}
          </Fragment>
        ))}
      </VStack>
    </Container>
  );
};
export default Jobs;

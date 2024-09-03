import React from "react";
import { Box, Flex, Text, Heading, VStack } from "@chakra-ui/react";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import { imagePrefix } from "@/app/config";
import Link from "next/link";

const fetchNews = async () => {
  try {
    const response = await axios.get(`${API_URL}/news/`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
};

const News = () => {
  const [news, setNews] = useState<
    {
      id: number;
      image: string;
      title: string;
      description: string;
    }[]
  >([]);
  const { isLoading, error, data } = useQuery("fetchNews", fetchNews);

  useEffect(() => {
    if (error || isLoading) {
      setNews([]);
    } else {
      setNews(data);
    }
  }, [error, data, isLoading]);

  return (
    <VStack p={5}>
      <Heading
        fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
        fontWeight={"bold"}
      >
        <Text textColor={"a4borange"}> News</Text>
      </Heading>
      <Box overflowX="auto" p={4} maxWidth="100%">
        <Flex gap={4}>
          {news.map((card, index) => (
            <Box
              key={index}
              w={300}
              borderWidth="1px"
              borderRadius="lg"
              backgroundColor="white"
              boxShadow="md"
              flexShrink={0}
            >
              <Image
                src={card.image}
                alt="Profile Photo"
                height={300}
                width={300}
              />
              <Box p={4}>
                <Text fontWeight="bold">{card.title}</Text>
                <Text noOfLines={4}>{card.description}</Text>
                <Link href={`${imagePrefix}/news/${card.id}`}>
                  <Text textColor={"a4borange"}>Read More</Text>
                </Link>
              </Box>
            </Box>
          ))}
        </Flex>
      </Box>
    </VStack>
  );
};

export default News;

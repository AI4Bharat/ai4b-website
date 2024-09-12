"use client";
import React from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  VStack,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import AI4BContainer from "./AI4BContainer";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import { imagePrefix } from "@/app/config";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import $ from "jquery";
import dynamic from "next/dynamic";

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
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    if (error || isLoading) {
      setNews([]);
    } else {
      setNews(data);
    }
  }, [error, data, isLoading]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ensure jQuery is available before initializing Owl Carousel
    if (typeof window !== "undefined") {
      window.$ = window.jQuery = $;
    }
    setIsMounted(true);
  }, []);

  // Dynamically import OwlCarousel to prevent SSR
  const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
    ssr: false,
  });

  const options = {
    loop: true,
    center: true,
    items: 3,
    margin: 10,
    autoplay: true,
    dots: false,
    autoplayTimeout: 1500,
    smartSpeed: 800,
    nav: true,
    navText: ["<-", "->"],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 3,
      },
      1000: {
        items: 3,
      },
    },
  };

  if (!isMounted) {
    return null; // Render nothing until the component mounts (on the client side)
  }

  return (
    <AI4BContainer>
      <Heading
        fontSize={{ base: "3xl", sm: "4xl", lg: "6xl" }}
        fontWeight={"bold"}
        textAlign={"center"}
        padding={"20px 0"}
      >
        <Text textColor={"a4borange"}> News</Text>
      </Heading>

      <OwlCarousel className="owl-carousel owl-theme" {...options}>
        {news.map((card, index) => (
          <LinkBox
            className="item"
            key={index}
            as="article"
            w={300}
            borderWidth="1px"
            borderRadius="lg"
            backgroundColor="white"
            boxShadow="md"
            flexShrink={0}
          >
            <Image src={card.image} alt="News Image" height={300} width={300} />
            <Box p={4}>
              <Text fontWeight="bold">{card.title}</Text>
              <Text noOfLines={4}>{card.description}</Text>
              <LinkOverlay href={`${imagePrefix}/news/${card.id}`}>
                <Text textColor={"a4borange"}>Read More</Text>
              </LinkOverlay>
            </Box>
          </LinkBox>
        ))}
      </OwlCarousel>
    </AI4BContainer>
  );
};

export default News;

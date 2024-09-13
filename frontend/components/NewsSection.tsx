"use client";
import React, { useEffect, useState } from "react";

// Extend the Window interface to include jQuery
declare global {
  interface Window {
    jQuery: any;
  }
}
import {
  Box,
  Text,
  Heading,
  LinkBox,
  LinkOverlay,
  Tooltip,
} from "@chakra-ui/react";
import AI4BContainer from "./AI4BContainer";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import axios from "axios";
import Image from "next/image";
import { imagePrefix } from "@/app/config";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import $ from "jquery";
import dynamic from "next/dynamic";
import Link from "next/link"; // Import Next.js Link

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
      published_on: string;
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

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.$ = window.jQuery = $;
    }
    setIsMounted(true);
  }, []);

  const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
    ssr: false,
  });

  const options = {
    loop: true,
    center: true,
    margin: 6,
    autoplay: true,
    dots: false,
    autoplayTimeout: 3000,
    smartSpeed: 800,
    nav: true,
    navText: ["<-", "->"],
    responsive: {
      0: {
        items: 1,
      },
      576: {
        items: 2,
      },
      768: {
        items: 2,
      },
      992: {
        items: 3,
      },
      1200: {
        items: 3,
      },
    },
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
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
            w={340}
            borderWidth="1px"
            borderRadius="lg"
            backgroundColor="white"
            boxShadow="md"
            flexShrink={0}
          >
            <Image src={card.image} alt="{card.title} Image" height={180} width={320} />
            <Box p={4}>
                <Text fontWeight="bold" noOfLines={1} zIndex={100}>
                  {card.title}
                </Text>
                <Text textColor="a4borange"> 
                  {new Date(card.published_on).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  })}
                </Text>
              <Text noOfLines={3}>{card.description}</Text>
                <Tooltip
                  label={card.title}
                  aria-label="Full title"
                  placement="top-start"
                >
                  <LinkOverlay as={Link} href={`${imagePrefix}/news/${card.id}`}>
                  <Text textColor="a4borange">Read More</Text>
                  </LinkOverlay>
                </Tooltip>
            </Box>
          </LinkBox>
        ))}
      </OwlCarousel>
    </div>
  );
};

export default News;

"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import $ from "jquery";
import { Box, Text, Heading, Stack, Flex, Image } from "@chakra-ui/react";
import { domainToASCII } from "url";
import { imagePrefix } from "@/app/config";

// Dynamically load OwlCarousel to avoid SSR issues
const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
  ssr: false,
});

const DataCollectionCarousel = () => {
  const [isMounted, setIsMounted] = useState(false);

  interface CardProps {
    image: string;
    text: string;
  }

  const Card = ({ image, text }: CardProps) => {
    return (
      <>
        <Box>
          <Image
            boxSize={80}

            objectFit="cover"
            src={`${imagePrefix}/assets/data-collection/${image}`}
            alt="{lang} - {location} Image"
          />
          <Text align={"center"} fontSize={"sm"}>
            {text}
          </Text>
        </Box>
      </>
    );
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.$ = window.jQuery = $;
    }
    setIsMounted(true);
  }, []);

  const options = {
    loop: true,
    center: true,
    margin: 2,
    autoplay: true,
    dots: true,
    autoplayTimeout: 3000,
    smartSpeed: 800,
    items: 1,
  };

  if (!isMounted) {
    return null;
  }

  const images = [
    {
      lang: "Bengali",
      location: "Birbhum, West Bengal",
      image: "bengali-birbhum-west-bengal.jpg",
    },
    {
      lang: "Bodo",
      location: "Kokrajhar, Assam",
      image: "bodo-kokrajhar-assam.jpg",
    },
    { lang: "Dogri", location: "Jammu", image: "dogri-jammu.jpg" },
    { lang: "Kashmiri", location: "Srinagar", image: "kashmiri-srinagar.jpg" },
    {
      lang: "Manipuri",
      location: "Imphal, Manipur",
      image: "manipuri-imphal-manipur.jpg",
    },
    {
      lang: "Nepali",
      location: "Kalimpong, West Bengal",
      image: "nepali-kalimpong-west-bengal.jpg",
    },
    {
      lang: "Odia",
      location: "Sambalpur, Odisha",
      image: "odia-sambalpur-odisha.jpg",
    },
    {
      lang: "Santali",
      location: "Bolpur, West Bengal",
      image: "santali-bolpur-west-bengal.jpg",
    },
    {
      lang: "Sindhi",
      location: "Thane, Maharashtra",
      image: "sindhi-thane-maharashtra.jpg",
    },
    {
      lang: "Tamil",
      location: "Madurai, Tamil Nadu",
      image: "tamil-madurai-tamil-nadu.jpg",
    },
    {
      lang: "Konkani",
      location: "Tiswadi Taluka, Goa",
      image: "konkani-tiswadi-taluka-goa.jpg",
    },
  ];
  return (
    <>
      <OwlCarousel className="owl-carousel owl-theme" {...options}>
        {images.map((item, index) => (
          <Card
            key={index}
            image={item.image}
            text={`${item.lang} - ${item.location}`}
          />
        ))}
      </OwlCarousel>
    </>
  );
};

export default DataCollectionCarousel;

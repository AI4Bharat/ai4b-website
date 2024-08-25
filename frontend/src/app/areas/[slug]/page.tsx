"use client";
import { useParams } from "next/navigation";
import {
  chakra,
  Link,
  Stack,
  Box,
  Button,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";

const areaInfo = {
  nmt: {
    title: "Machine Translation",
    description:
      "AI4Bharat is a pioneering initiative focused on building open-source AI solutions that address challenges unique to India. One of their significant contributions is in the field of machine translation, where they aim to bridge the linguistic diversity of the country. AI4Bharat has developed state-of-the-art models that facilitate the translation of text between Indian languages, enabling seamless communication across different linguistic communities. Their work includes creating large-scale datasets, fine-tuning models for regional languages, and ensuring these tools are accessible to developers and researchers. This initiative not only promotes inclusivity but also helps preserve the rich linguistic heritage of India by making digital content available in multiple languages.",
  },
};

export default function Areas() {
  const params = useParams();
  const slug = params.slug as keyof typeof areaInfo;

  return (
    <Box pb={8}>
      <Stack
        pos="relative"
        bgGradient="linear(to-l, #ff944d,#ff6600)"
        height="250px"
        w="100%"
      ></Stack>
      <Box
        maxW="3xl"
        p={4}
        isolation="isolate"
        zIndex={3}
        mt="-10rem"
        marginInline="auto"
      >
        <Box
          boxShadow={useColorModeValue(
            "0 4px 6px rgba(160, 174, 192, 0.6)",
            "0 4px 6px rgba(9, 17, 28, 0.9)"
          )}
          bg={useColorModeValue("white", "gray.800")}
          p={{ base: 4, sm: 8 }}
          overflow="hidden"
          rounded="2xl"
        >
          {areaInfo[slug] ? (
            <Stack
              pos="relative"
              zIndex={1}
              direction="column"
              spacing={5}
              textAlign="left"
            >
              <chakra.h1 fontSize="4xl" lineHeight={1.2} fontWeight="bold">
                {areaInfo[slug].title}
              </chakra.h1>
              <chakra.h1
                color="gray.400"
                fontSize="xl"
                maxW="600px"
                lineHeight={1.2}
              >
                {areaInfo[slug].description}
              </chakra.h1>
            </Stack>
          ) : (
            <></>
          )}
        </Box>
      </Box>
    </Box>
  );
}

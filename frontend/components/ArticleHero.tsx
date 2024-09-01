"use client";

import {
  Container,
  Stack,
  Flex,
  Box,
  Heading,
  Text,
  Button,
  Image,
  Icon,
  IconButton,
  createIcon,
  IconProps,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";

export default function ArticleHero({
  title,
  image,
  link,
  description,
}: {
  title: string;
  image: string;
  link: string;
  description: string;
}) {
  return (
    <Container maxW={"7xl"}>
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
            <Text as={"span"} position={"relative"}>
              {title}
            </Text>
          </Heading>
          <Text color={"gray.500"}>{description}</Text>
          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={{ base: "column", sm: "row" }}
          >
            {link !== "" ? (
              <Button
                as={Link}
                href={link}
                rounded={"full"}
                size={"lg"}
                fontWeight={"normal"}
                px={6}
                colorScheme={"red"}
                bg={"red.400"}
                _hover={{ bg: "red.500" }}
              >
                Check Out
              </Button>
            ) : (
              <></>
            )}
          </Stack>
        </Stack>
        <Flex
          flex={1}
          justify={"center"}
          align={"center"}
          position={"relative"}
          w={"full"}
          boxShadow={"2xl"}
          borderRadius={35}
        >
          <Image alt={"Hero Image"} fit={"cover"} src={image} />
        </Flex>
      </Stack>
    </Container>
  );
}

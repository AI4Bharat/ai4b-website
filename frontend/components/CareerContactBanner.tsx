"use client";
import {
  chakra,
  Stack,
  useColorModeValue,
  Container,
  Link,
  Box,
  Button,
} from "@chakra-ui/react";

const CareerContactBanner = () => {
  return (
    <Container maxW="5xl" p="6">
      <Banner />
    </Container>
  );
};

const Banner = () => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      spacing={5}
      alignItems={{ base: "flex-start", md: "center" }}
      justifyContent="space-between"
      rounded="lg"
      boxShadow="md"
      bg={useColorModeValue("gray.100", "gray.700")}
      p={{ base: 8, md: 16 }}
    >
      <Box>
        <chakra.h1 fontSize="4xl" lineHeight={1.2} fontWeight="bold">
          Want to work at AI4Bharat?
        </chakra.h1>
        <chakra.h2
          fontSize="2xl"
          lineHeight={1.2}
          fontWeight="bold"
          bgGradient="linear(to-l, #ff944d,#ff6600)"
          bgClip="text"
        >
          Get in touch or apply to available roles.
        </chakra.h2>
      </Box>
      <Stack
        direction={{ base: "column", sm: "row" }}
        spacing={{ base: 0, sm: 3 }}
        w={{ base: "100%", sm: "auto" }}
      >
        <Button
          as={Link}
          href="mailto:enquiry@ai4bharat.org"
          color="white"
          variant="solid"
          size="lg"
          rounded="md"
          mb={{ base: 2, sm: 0 }}
          lineHeight={1}
          bgGradient="linear(to-l, #ff944d,#ff6600)"
          _hover={{ bgGradient: "linear(to-l, #ff944d,#ff6600)" }}
        >
          Contact
        </Button>
      </Stack>
    </Stack>
  );
};

export default CareerContactBanner;

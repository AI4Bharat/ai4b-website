"use client";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
  useColorModeValue,
  Skeleton,
  Wrap,
  Image,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";

export default function Maintenance() {
  return (
    <Box p={4}>
      <Stack spacing={4} as={Container} maxW={"3xl"} textAlign={"center"}>
        <Heading fontSize={{ base: "2xl", sm: "4xl" }} fontWeight={"bold"}>
          Under Maintenance!
        </Heading>
      </Stack>
    </Box>
  );
}

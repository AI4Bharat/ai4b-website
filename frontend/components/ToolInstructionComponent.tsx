import {
  chakra,
  Container,
  Stack,
  HStack,
  VStack,
  Flex,
  Text,
  Image,
  Box,
  Code,
  Heading,
} from "@chakra-ui/react";

interface Instruction {
  instruction: string;
  codeString: string;
  type: string;
}

export default function ToolInstructions({
  steps,
}: {
  steps: Array<Instruction>;
}) {
  return (
    <Container borderWidth={3} borderRadius={25} p={5} maxW="20xl">
      <chakra.h2 fontSize="4xl" fontWeight="bold" mb={2}>
        Installation Steps
      </chakra.h2>
      <br />
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={{ base: 0, md: 3 }}
      >
        <VStack spacing={4} alignItems="flex-start" mb={{ base: 5, md: 0 }}>
          {steps.map((data, index) => (
            <Box key={index}>
              <HStack spacing={2}>
                {data.type === "instruction" ? (
                  <Text fontSize="xl">{data.instruction}</Text>
                ) : (
                  <Heading>{data.instruction}</Heading>
                )}
              </HStack>
              {data.codeString === null ? (
                <></>
              ) : (
                <Code borderRadius={15} p={5} fontSize="md" color="gray.500">
                  {data.codeString}
                </Code>
              )}
            </Box>
          ))}
        </VStack>
      </Stack>
    </Container>
  );
}

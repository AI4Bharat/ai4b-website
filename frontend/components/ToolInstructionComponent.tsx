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
  Button,
  useToast,
} from "@chakra-ui/react";
import { FaCopy } from "react-icons/fa";

interface Instruction {
  instruction: string;
  codeString: string;
  type: string;
}

export default function ToolInstructions({
  title,
  steps,
}: {
  title: string;
  steps: Array<Instruction>;
}) {
  const toast = useToast();
  return (
    <Container borderWidth={3} borderRadius={25} p={5} maxW="20xl">
      <chakra.h2 fontSize="2xl" fontWeight="bold" mb={2}>
        {title}
      </chakra.h2>
      <br />
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={{ base: 0, md: 3 }}
      >
        <VStack
          overflowY={"scroll"}
          spacing={4}
          alignItems="flex-start"
          mb={{ base: 5, md: 0 }}
        >
          {steps.map((data, index) => (
            <Box key={index}>
              <HStack spacing={2}>
                {data.type === "instruction" ? (
                  <>
                    {data.instruction === "" ? (
                      <></>
                    ) : (
                      <Text fontSize="1xl">{data.instruction}</Text>
                    )}
                  </>
                ) : (
                  <Heading fontSize="2xl">{data.instruction}</Heading>
                )}
              </HStack>
              {data.codeString === null ? (
                <></>
              ) : (
                <Code
                  whiteSpace={"pre-wrap"}
                  borderRadius={15}
                  p={5}
                  fontSize="sm"
                  color="gray.500"
                  textOverflow={"clip"}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={5}
                >
                  {data.codeString}
                  <Box
                    as={Button}
                    onClick={() => {
                      navigator.clipboard.writeText(data.codeString);
                      toast({
                        title: "Copied Snippet",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                      });
                    }}
                  >
                    <FaCopy color="gray" />
                  </Box>
                </Code>
              )}
            </Box>
          ))}
        </VStack>
      </Stack>
    </Container>
  );
}

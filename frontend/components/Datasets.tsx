"use client";
import { ReactElement } from "react";
import {
  Box,
  SimpleGrid,
  Icon,
  Text,
  Stack,
  Flex,
  Heading,
  Container,
  Card,
  CardBody,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { FcAssistant, FcDonate, FcInTransit } from "react-icons/fc";

interface FeatureProps {
  title: string;
  icon: ReactElement;
}

const datasets: { [key: string]: { path: string; icon: string } } = {
  Sangraha: { path: "", icon: "/assets/icons/llm.png" },
  Samanantar: { path: "", icon: "/assets/icons/mt.png" },
  BPCC: { path: "", icon: "/assets/icons/mt.png" },
  Shrutilipi: { path: "", icon: "/assets/icons/asr.png" },
  Svarah: { path: "", icon: "/assets/icons/asr.png" },
  Lahaja: { path: "", icon: "/assets/icons/asr.png" },
  IndicVoices: { path: "", icon: "/assets/icons/asr.png" },
  Rasa: { path: "", icon: "/assets/icons/tts.png" },
  Aksharantar: { path: "", icon: "/assets/icons/xlit.png" },
};

const Feature = ({ title, icon }: FeatureProps) => {
  return (
    <Stack>
      <Flex
        w={16}
        h={16}
        align={"center"}
        justify={"center"}
        color={"white"}
        rounded={"full"}
        bg={"gray.100"}
        mb={1}
      >
        {icon}
      </Flex>
      <Text fontWeight={600}>{title}</Text>
    </Stack>
  );
};

export default function Datasets() {
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
            <Text
              as={"span"}
              position={"relative"}
              _after={{
                content: "''",
                width: "full",
                height: "30%",
                position: "absolute",
                bottom: 1,
                left: 0,
                bg: "red.400",
                zIndex: -1,
              }}
            >
              Pioneering
            </Text>
            <br />
            <Text as={"span"} color={"red.400"}>
              Data Collection!
            </Text>
          </Heading>
          <Flex
            flex={1}
            justify={"center"}
            align={"center"}
            position={"relative"}
            w={"full"}
          >
            <Box
              position={"relative"}
              height={"300px"}
              rounded={"2xl"}
              boxShadow={"2xl"}
              width={"full"}
              overflow={"hidden"}
            >
              <Image
                alt={"Hero Image"}
                fit={"cover"}
                align={"center"}
                w={"100%"}
                h={"100%"}
                src={"/assets/data-collection.png"}
              />
            </Box>
          </Flex>
        </Stack>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {Object.keys(datasets).map((key) => (
            <Card key={key} border={"solid"} borderColor={"orange"}>
              <CardBody>
                <Feature
                  icon={
                    <Image
                      src={datasets[key].icon}
                      alt="Icon"
                      width={50}
                      height={50}
                    />
                  }
                  title={key}
                />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}

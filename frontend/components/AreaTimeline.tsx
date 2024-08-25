import React from "react";
import {
  Box,
  chakra,
  Container,
  Link,
  Text,
  HStack,
  VStack,
  Flex,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
// Here we have used react-icons package for the icons
import { FaPaperclip, FaGithub } from "react-icons/fa";
import { BsGithub } from "react-icons/bs";
import { IconType } from "react-icons";

interface Publication {
  title: string;
  description: string;
  area: string;
  conference: string;
  published_on: string;
  hf_link: string;
  paper_link: string;
  github_link: string;
  type: string;
}

const AreaTimeline = ({ data }: { data: Array<Publication> }) => {
  return (
    <Container maxWidth="4xl" p={{ base: 2, sm: 10 }}>
      <chakra.h3 fontSize="4xl" fontWeight="bold" mb={18} textAlign="center">
        Timeline
      </chakra.h3>
      {data.map((entry, index) => (
        <Flex key={index} mb="10px">
          <LineWithDot />
          <Card {...entry} />
        </Flex>
      ))}
    </Container>
  );
};

interface CardProps {
  title: string;
  description: string;
  area: string;
  published_on: string;
  hf_link: string;
  paper_link: string;
  github_link: string;
  type: string;
}

const Card = ({
  title,
  description,
  area,
  published_on,
  hf_link,
  paper_link,
  github_link,
  type,
}: CardProps) => {
  return (
    <HStack
      p={{ base: 3, sm: 6 }}
      bg={useColorModeValue("gray.100", "gray.800")}
      spacing={5}
      rounded="lg"
      alignItems="center"
      pos="relative"
      _before={{
        content: `""`,
        w: "0",
        h: "0",
        borderColor: `transparent ${useColorModeValue(
          "#edf2f6",
          "#1a202c"
        )} transparent`,
        borderStyle: "solid",
        borderWidth: "15px 15px 15px 0",
        position: "absolute",
        left: "-15px",
        display: "block",
      }}
    >
      <Box>
        <VStack spacing={2} mb={3} textAlign="left">
          <chakra.h1
            as={Link}
            _hover={{ color: "teal.400" }}
            fontSize="2xl"
            lineHeight={1.2}
            fontWeight="bold"
            w="100%"
          >
            {title}
          </chakra.h1>
          <Text fontSize="md">{description}</Text>
          <HStack>
            <Link target="_blank" href={github_link}>
              <FaGithub size={50} />
            </Link>
            <Link target="_blank" href={paper_link}>
              <FaPaperclip size={50} />
            </Link>
            <Link target="_blank" href={hf_link}>
              <img
                src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
                alt="Hugging Face"
                style={{ width: "50px", height: "50px" }}
              />
            </Link>
          </HStack>
        </VStack>
        <Text fontSize="sm">{published_on}</Text>
        {type === "Model" ? (
          <Button
            as={Link}
            href={`/areas/model/${area}/${title}`}
            borderColor={"a4borange"}
            variant={"outline"}
            color={"a4borange"}
          >
            Try it Out!
          </Button>
        ) : (
          <></>
        )}
      </Box>
    </HStack>
  );
};

const LineWithDot = () => {
  return (
    <Flex pos="relative" alignItems="center" mr="40px">
      <chakra.span
        position="absolute"
        left="50%"
        height="calc(100% + 10px)"
        border="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        top="0px"
      ></chakra.span>
      <Box pos="relative" p="10px">
        <Box
          pos="absolute"
          width="100%"
          height="100%"
          bottom="0"
          right="0"
          top="0"
          left="0"
          backgroundSize="cover"
          backgroundRepeat="no-repeat"
          backgroundPosition="center center"
          backgroundColor="rgb(255, 255, 255)"
          borderRadius="100px"
          border="3px solid rgb(255, 102, 0)"
          backgroundImage="none"
          opacity={1}
        ></Box>
      </Box>
    </Flex>
  );
};

export default AreaTimeline;

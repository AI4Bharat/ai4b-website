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
  useBreakpointValue,
  Accordion,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  AccordionItem,
} from "@chakra-ui/react";
// Here we have used react-icons package for the icons
import { FaPaperclip, FaGithub, FaArrowDown } from "react-icons/fa";
import { BsGithub } from "react-icons/bs";
import { IconType } from "react-icons";
import { useState } from "react";

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
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <Container maxWidth="7xl" p={{ base: 2, sm: 10 }}>
      <chakra.h3 fontSize="4xl" fontWeight="bold" mb={18} textAlign="center">
        Milestones
      </chakra.h3>
      {data.map((milestone, index) => (
        <Flex key={index} mb="10px">
          {/* Desktop view(left card) */}
          {isDesktop && index % 2 === 0 && (
            <>
              <EmptyCard />
              <LineWithDot />
              <Card index={0} {...milestone} />
            </>
          )}

          {/* Mobile view */}
          {isMobile && (
            <>
              <LineWithDot />
              <Card index={0} {...milestone} />
            </>
          )}

          {/* Desktop view(right card) */}
          {isDesktop && index % 2 !== 0 && (
            <>
              <Card index={0} {...milestone} />

              <LineWithDot />
              <EmptyCard />
            </>
          )}
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
  conference: string;
  hf_link: string;
  paper_link: string;
  github_link: string;
  type: string;
  index: number;
}

const EmptyCard = () => {
  return (
    <Box
      flex={{ base: 0, md: 1 }}
      p={{ base: 0, md: 6 }}
      bg="transparent"
    ></Box>
  );
};

const ExpandableText = ({
  text,
  noOfLines = 2,
}: {
  text: string;
  noOfLines: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => setIsExpanded(!isExpanded);

  return (
    <Box onClick={handleToggle} cursor="pointer">
      <Text noOfLines={isExpanded ? undefined : noOfLines}>{text}</Text>
      <Text textColor="a4borange" mt={1}>
        {isExpanded ? "Show less" : "Read more"}
      </Text>
    </Box>
  );
};

const Card = ({
  title,
  description,
  area,
  published_on,
  conference,
  hf_link,
  paper_link,
  github_link,
  type,
  index,
}: CardProps) => {
  const isEvenId = index % 2 == 0;
  let borderWidthValue = isEvenId ? "15px 15px 15px 0" : "15px 0 15px 15px";
  let leftValue = isEvenId ? "-15px" : "unset";
  let rightValue = isEvenId ? "unset" : "-15px";

  const isMobile = useBreakpointValue({ base: true, md: false });
  if (isMobile) {
    leftValue = "-15px";
    rightValue = "unset";
    borderWidthValue = "15px 15px 15px 0";
  }
  return (
    <HStack
      flex={1}
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
        borderWidth: borderWidthValue,
        position: "absolute",
        left: leftValue,
        right: rightValue,
        display: "block",
      }}
    >
      <Box>
        <Text fontSize="lg" color={isEvenId ? "teal.400" : "blue.400"}>
          {published_on}
        </Text>

        <VStack spacing={2} mb={3} textAlign="left">
          <chakra.h1 fontSize="2xl" lineHeight={1.2} fontWeight="bold" w="100%">
            {title}
          </chakra.h1>
          <ExpandableText noOfLines={2} text={description} />
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
        <br />
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

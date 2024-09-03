import React from "react";
import {
  Box,
  chakra,
  Container,
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
import { FaPaperclip, FaGithub, FaCode } from "react-icons/fa";
import { useState } from "react";
import { imagePrefix } from "@/app/config";
import Link from "next/link";
import Image from "next/image";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface Publication {
  title: string;
  description: string;
  area: string;
  conference: string;
  published_on: string;
  hf_id: string;
  paper_link: string;
  github_link: string;
  colab_link: string;
  website_link: string;
  type: string;
}

const AreaTimeline = ({ data }: { data: Array<Publication> }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <Container
      height={isMobile ? 500 : "auto"}
      overflowY={"scroll"}
      maxWidth="7xl"
      p={{ base: 1, sm: 5 }}
    >
      <chakra.h3 fontSize="4xl" fontWeight="bold" mb={18} textAlign="center">
        Timeline
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
  hf_id: string;
  paper_link: string;
  github_link: string;
  website_link: string;
  colab_link: string;
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
      <Text fontSize={13} noOfLines={isExpanded ? undefined : noOfLines}>
        {text}
      </Text>
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
  hf_id,
  paper_link,
  github_link,
  website_link,
  colab_link,
  type,
  index,
}: CardProps) => {
  const dateObject = new Date(published_on);
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
      alignItems="center"
      pos="relative"
      borderRadius={30}
      left={leftValue}
      right={rightValue}
    >
      <Box>
        <HStack mb={3}>
          <HStack spacing={2} mb={1}>
            <Box p={2} bg="a4borange" borderRadius={15}>
              <HStack>
                <Text fontSize="sm" textColor={"white"}>
                  {monthNames[dateObject.getMonth()]}
                </Text>
                <Text fontSize="sm" textColor={"white"}>
                  {dateObject.getFullYear()}
                </Text>
              </HStack>
            </Box>
            <Box p={2} bg="a4borange" borderRadius={15}>
              <Text textColor={"white"} fontSize="sm">
                {type}
              </Text>
            </Box>
            <Box p={2} bg="a4borange" borderRadius={15}>
              <Text textColor={"white"} fontSize="sm">
                {conference}
              </Text>
            </Box>
          </HStack>
        </HStack>

        <VStack spacing={1} mb={3} textAlign="left">
          <chakra.h1
            as={Link}
            href={
              type === "Model"
                ? `${imagePrefix}/areas/model/${area}/${title}`
                : website_link || `${imagePrefix}`
            }
            fontSize="1xl"
            lineHeight={1.2}
            fontWeight="bold"
            w="100%"
          >
            {title}
          </chakra.h1>
          <ExpandableText noOfLines={2} text={description} />
          <HStack>
            {github_link ? (
              <Link target="_blank" href={github_link}>
                <FaGithub size={25} />
              </Link>
            ) : (
              <></>
            )}
            {colab_link ? (
              <Link target="_blank" href={colab_link}>
                <FaCode size={25} />
              </Link>
            ) : (
              <></>
            )}
            <Link target="_blank" href={paper_link}>
              <FaPaperclip size={25} />
            </Link>
            {hf_id === null ? (
              <></>
            ) : (
              <Link
                target="_blank"
                href={
                  type === "Model"
                    ? `https://huggingface.co/${hf_id}`
                    : `https://huggingface.co/datasets/${hf_id}`
                }
              >
                <img
                  src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg"
                  alt="Hugging Face"
                  style={{ width: "25px", height: "25px" }}
                />
              </Link>
            )}
          </HStack>
        </VStack>
        {type === "Model" ? (
          <Button
            as={Link}
            href={`${imagePrefix}/areas/model/${area}/${title}`}
            borderColor={"a4borange"}
            variant={"outline"}
            color={"a4borange"}
            fontSize={15}
          >
            View Model
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

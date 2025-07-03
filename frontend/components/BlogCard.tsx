//blog cards
"use client";

import { useState } from "react";
import {
  Center,
  VStack,
  Box,
  Button,
  Icon,
  Text,
  Heading,
  HStack,
  useColorModeValue,
  AspectRatio,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { FaBookOpen, FaCalendarAlt, FaClock, FaArrowRight } from "react-icons/fa";

const MotionBox = motion(Box);

interface Blog {
  id: number;
  title: string;
  description: string;
  published_on: string;
  image: string | null;
  related_link: string | null;
  markdown_content: string;
  page_url: string;
  cover_image?: { src: string; alt: string; caption?: string } | null;
  authors?: Array<{ name: string; affiliationId?: string }>;
  affiliations?: Array<{ id: string; name: string }>;
  publication_links?: Array<{ text: string; url: string; icon?: string }> | null;
  sections?: Array<{
    type: string;
    heading?: string;
    content?: string;
    headers?: string[];
    rows?: string[][];
    items?: Array<{ id: string; prompt: string; response: string }>;
    image?: { src: string; alt?: string; caption?: string };
  }>;
  team?: {
    students?: Array<{ name: string }>;
    advisors?: Array<{ name: string }>;
    contacts?: Array<{ name: string; email?: string }>;
  };
  bibtex?: string;
}

// Helper functions for blog content processing
function getSectionsArray(sections: any): any[] {
  if (Array.isArray(sections)) {
    return sections;
  }
  if (typeof sections === 'string') {
    try {
      const parsed = JSON.parse(sections);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

function getReadingTime(content: string, sections?: any[]): string {
  const WORDS_PER_MINUTE = 225;
  let totalText = content || '';
  
  if (sections && Array.isArray(sections)) {
    sections.forEach(section => {
      if (section.heading) totalText += ' ' + section.heading;
      if (section.content) totalText += ' ' + section.content;
      if (section.type === 'table') {
        if (section.headers && Array.isArray(section.headers)) {
          totalText += ' ' + section.headers.join(' ');
        }
        if (section.rows && Array.isArray(section.rows)) {
          section.rows.forEach((row: string[]) => {
            if (Array.isArray(row)) totalText += ' ' + row.join(' ');
          });
        }
      }
      if (section.type === 'examples' && section.items && Array.isArray(section.items)) {
        section.items.forEach((item: { id: string; prompt: string; response: string }) => {
          if (item.prompt) totalText += ' ' + item.prompt;
          if (item.response) totalText += ' ' + item.response;
        });
      }
      if (section.image && section.image.caption) totalText += ' ' + section.image.caption;
    });
  }
  
  if (!totalText || totalText.trim().length === 0) return "1 min read";
  
  const cleanText = totalText
    .replace(/[#*_`~\[\]()]/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// BlogCard Component with Framer Motion animations
export default function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const [imageError, setImageError] = useState(false);
  
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("orange.100", "orange.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const hoverBorderColor = useColorModeValue("orange.300", "orange.500");

  const readingTime = getReadingTime(blog.markdown_content, getSectionsArray(blog.sections));
  const authorNames = blog.authors?.map(author => author.name).join(", ") || "AI4Bharat Team";
  const coverImageSrc = blog.image || blog.cover_image?.src;

  return (
    <MotionBox
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      whileHover={shouldReduceMotion ? {} : { 
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      height="auto"
    >
      <Box
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        bg={cardBg}
        boxShadow="sm"
        transition="all 0.2s ease"
        _hover={{
          boxShadow: "lg",
          borderColor: hoverBorderColor,
        }}
        height="100%"
        display="flex"
        flexDirection="column"
        position="relative"
        role="article"
      >
        <AspectRatio ratio={16/9} bg="orange.50">
          {coverImageSrc && !imageError ? (
            <Image
              src={coverImageSrc}
              alt={blog.cover_image?.alt || blog.title}
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
              quality={75}
            />
          ) : (
            <Center bg="orange.50">
              <VStack spacing={2}>
                <Icon as={FaBookOpen} fontSize="2xl" color="orange.400" />
                <Text color="orange.600" fontSize="sm" fontWeight="medium">
                  Article
                </Text>
              </VStack>
            </Center>
          )}
        </AspectRatio>

        <Box p={6} display="flex" flexDirection="column" flex={1}>
          <HStack justify="space-between" align="center" mb={3}>
            <HStack spacing={2} fontSize="xs" color={textColor}>
              <Icon as={FaCalendarAlt} />
              <Text>{formatDate(blog.published_on)}</Text>
            </HStack>
            <HStack spacing={2} fontSize="xs" color={textColor}>
              <Icon as={FaClock} />
              <Text>{readingTime}</Text>
            </HStack>
          </HStack>

          <Heading
            as="h3"
            fontSize="lg"
            fontWeight="semibold"
            color={headingColor}
            lineHeight="1.3"
            mb={3}
            minHeight="2.6em"
            display="-webkit-box"
            sx={{
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {blog.title}
          </Heading>

          <Text
            fontSize="sm"
            color={textColor}
            lineHeight="1.5"
            mb={4}
            flex={1}
            minHeight="4.5em"
            display="-webkit-box"
            sx={{
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {blog.description}
          </Text>

          <Text fontSize="xs" color={textColor} mb={4} fontWeight="medium">
            By {authorNames.length > 30 ? `${authorNames.substring(0, 30)}...` : authorNames}
          </Text>

          <Button
            as={Link}
            href={`/blog/${blog.page_url || blog.id}`}
            colorScheme="orange"
            size="sm"
            variant="solid"
            borderRadius="md"
            fontWeight="medium"
            rightIcon={<Icon as={FaArrowRight} fontSize="xs" />}
            _hover={{ 
              transform: shouldReduceMotion ? 'none' : 'translateY(-1px)',
              boxShadow: "md"
            }}
            mt="auto"
          >
            Read Article
          </Button>
        </Box>
      </Box>
    </MotionBox>
  );
}

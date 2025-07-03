"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  FaChevronRight, FaBook, FaCode, FaCopy, FaGithub, FaDatabase, 
  FaPlay, FaArrowUp, FaUser, FaExternalLinkAlt, FaHome
} from 'react-icons/fa';
import { SiHuggingface } from 'react-icons/si';
import {
  Container, Heading, Text, Box, Button, VStack, Center, Icon,
  useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, HStack,
  Card, CardBody, CardHeader, Grid, GridItem, Badge, Progress,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalBody, ModalCloseButton, useToast, Spinner, TableContainer,
  Stack, Divider, Flex, Spacer, IconButton, Skeleton, Alert,
  AlertIcon, AlertTitle, AlertDescription, useBreakpointValue
} from '@chakra-ui/react';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

interface BlogSection {
  type: 'markdown' | 'table' | 'examples' | 'image';
  heading?: string;
  heading_level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  content?: string;
  headers?: string[];
  rows?: string[][];
  items?: Array<{ id: string; prompt: string; response: string }>;
  image?: { src: string; alt?: string; caption?: string };
}

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
  sections?: BlogSection[];
  team?: {
    students?: Array<{ name: string }>;
    advisors?: Array<{ name: string }>;
    contacts?: Array<{ name: string; email?: string }>;
  };
  bibtex?: string;
}

interface BlogContentDisplayProps {
  blog: Blog;
}

function getSectionsArray(sections: any): BlogSection[] {
  if (Array.isArray(sections)) {
    return sections;
  }
  if (typeof sections === 'string') {
    try {
      const parsed = JSON.parse(sections);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse sections:', e);
      return [];
    }
  }
  return [];
}

function getReadingTime(markdownContent: string, sections?: BlogSection[]): string {
  const WORDS_PER_MINUTE = 225;
  
  let totalText = markdownContent || '';
  
  if (sections && Array.isArray(sections)) {
    sections.forEach(section => {
      if (section.heading) totalText += ' ' + section.heading;
      if (section.content) totalText += ' ' + section.content;
      
      if (section.type === 'table' && section.headers && section.rows) {
        totalText += ' ' + section.headers.join(' ');
        section.rows.forEach((row: string[]) => {
          totalText += ' ' + row.join(' ');
        });
      }
      
      if (section.type === 'examples' && section.items) {
        section.items.forEach(item => {
          totalText += ' ' + (item.prompt || '') + ' ' + (item.response || '');
        });
      }
      
      if (section.image?.caption) {
        totalText += ' ' + section.image.caption;
      }
    });
  }
  
  const cleanText = totalText
    .replace(/[#*_`~\[\]()]/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const minutes = Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE));
  
  return `${minutes} min read`;
}

function renderHeading(heading: string, level: string = 'h2', headingColor: string) {
  const HeadingComponent = level as keyof JSX.IntrinsicElements;
  return React.createElement(HeadingComponent, {
    className: `blog-heading ${level}`,
    style: {
      fontSize: level === 'h1' ? '1.875rem' : level === 'h2' ? '1.5rem' : '1.25rem',
      fontWeight: 'bold',
      marginTop: '2rem',
      marginBottom: '1rem',
      color: headingColor,
      lineHeight: '1.3'
    }
  }, heading);
}

function getIconComponent(iconName: string) {
  const iconMap: Record<string, any> = {
    'github': FaGithub,
    'arxiv': FaBook,
    'huggingface': SiHuggingface,
    'dataset': FaDatabase,
    'book': FaBook,
    'code': FaCode,
    'external': FaExternalLinkAlt,
  };
  return iconMap[iconName?.toLowerCase()] || FaExternalLinkAlt;
}

// Updated dynamic title formatting function
function formatTitle(title: string): string {
  return title
    .split(' ')
    .map((word, index, words) => {
      const analysis = analyzeWord(word);
      
      if (analysis.preserveOriginal) {
        return word;
      }
      
      if (analysis.isArticle && index > 0 && index < words.length - 1) {
        return word.toLowerCase();
      }
      
      return analysis.formatted;
    })
    .join(' ');
}

function analyzeWord(word: string) {
  const original = word;
  const clean = word.replace(/[^\w]/g, '');
  const lower = clean.toLowerCase();
  
  // Preserve original for complex patterns
  if (isComplexPattern(clean)) {
    return { preserveOriginal: true, formatted: original };
  }
  
  // Check if it's an article/preposition
  const articles = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with'];
  if (articles.includes(lower)) {
    return { isArticle: true, formatted: original };
  }
  
  // Standard title case
  const formatted = original.charAt(0).toUpperCase() + original.slice(1).toLowerCase();
  return { formatted };
}

function isComplexPattern(word: string): boolean {
  if (!word) return false;
  
  // Pattern detection rules
  const patterns = [
    /^[A-Z]{2,}$/, // All caps: AI, API, LLM
    /^[A-Z]+\d+[A-Z]*$/i, // Alphanumeric: AI4Bharat, GPT3
    /[a-z][A-Z]/, // CamelCase: iPhone, JavaScript
    /[A-Z]{2,}[a-z]/, // Mixed: APIs, URLs
    /^\d+[A-Z]/i, // Number-letter: 5G, 4K
    /[A-Z].*'s?$/, // Possessive with caps: McDonald's
  ];
  
  return patterns.some(pattern => pattern.test(word));
}

function StickyNavigation({ title }: { title: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const navBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  const borderColor = useColorModeValue('orange.200', 'orange.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!title) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionBox
          initial={shouldReduceMotion ? {} : { opacity: 0, y: -50 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, y: -50 }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
          bg={navBg}
          backdropFilter="blur(10px)"
          borderBottom="1px solid"
          borderColor={borderColor}
          py={3}
          px={4}
        >
          <Container maxW="container.lg">
            <Flex align="center">
              <Button
                as={Link}
                href="/blog"
                variant="ghost"
                colorScheme="orange"
                leftIcon={<Icon as={FaHome} />}
                size="sm"
                aria-label="Back to blog home"
              >
                Blog
              </Button>
              <Spacer />
              <Text 
                fontSize="sm" 
                fontWeight="medium" 
                color={textColor}
                noOfLines={1}
                maxW="60%"
              >
                {title}
              </Text>
            </Flex>
          </Container>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}

function ResponsiveTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const borderColor = useColorModeValue('orange.200', 'orange.600');
  const headerBg = useColorModeValue('orange.50', 'orange.800');
  const hoverBg = useColorModeValue('orange.100', 'orange.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const headerTextColor = useColorModeValue('orange.800', 'orange.100');

  if (!headers?.length || !rows?.length) {
    return (
      <Alert status="info" borderRadius="md" borderColor="orange.200">
        <AlertIcon color="orange.500" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>Table data is currently unavailable.</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <Box display={{ base: 'none', lg: 'block' }} overflowX="auto" my={6}>
        <TableContainer>
          <Table 
            variant="simple" 
            size="sm" 
            role="table"
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="md"
            overflow="hidden"
            border="1px solid"
            borderColor={borderColor}
          >
            <Thead bg={headerBg}>
              <Tr>
                {headers.map((header, idx) => (
                  <Th 
                    key={idx}
                    borderColor={borderColor}
                    fontWeight="medium"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="wide"
                    py={3}
                    px={4}
                    scope="col"
                    color={headerTextColor}
                    borderBottom="1px solid"
                    borderBottomColor={borderColor}
                  >
                    {header}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row, idx) => (
                <Tr 
                  key={idx}
                  _hover={{ bg: hoverBg }}
                  transition="background 0.2s ease"
                  borderBottom={idx < rows.length - 1 ? "1px solid" : "none"}
                  borderBottomColor={borderColor}
                >
                  {row.map((cell, cellIdx) => (
                    <Td 
                      key={cellIdx}
                      borderColor={borderColor}
                      py={2}
                      px={4}
                      fontSize="sm"
                      color={textColor}
                      fontWeight={cell === 'Total' || cell?.includes('**') ? 'bold' : 'normal'}
                    >
                      {cell?.replace(/\*\*/g, '') || '-'}
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile Cards */}
      <Box display={{ base: 'block', lg: 'none' }} my={6}>
        <VStack spacing={3} align="stretch">
          {rows.map((row, idx) => (
            <Card 
              key={idx}
              variant="outline"
              size="sm"
              bg={useColorModeValue('white', 'gray.800')}
              borderColor={borderColor}
              borderWidth="1px"
              borderRadius="md"
              _hover={{ 
                borderColor: 'orange.300',
                transform: 'translateY(-1px)'
              }}
              transition="all 0.2s ease"
            >
              <CardBody p={3}>
                <VStack spacing={2} align="stretch">
                  {headers.map((header, headerIdx) => (
                    <Box key={headerIdx}>
                      <Text 
                        fontSize="xs" 
                        fontWeight="medium" 
                        color="orange.500"
                        textTransform="uppercase"
                        letterSpacing="wide"
                        mb={1}
                      >
                        {header}
                      </Text>
                      <Text 
                        fontSize="sm" 
                        color={textColor}
                        fontWeight={row[headerIdx] === 'Total' || row[headerIdx]?.includes('**') ? 'bold' : 'normal'}
                      >
                        {row[headerIdx]?.replace(/\*\*/g, '') || '-'}
                      </Text>
                      {headerIdx < headers.length - 1 && (
                        <Divider mt={1} borderColor={borderColor} />
                      )}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Box>
    </>
  );
}

function InteractivePromptDemo({ examples }: { examples: any[] }) {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();

  const handleTryPrompt = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setSelectedPrompt(prompt);
    
    setTimeout(() => {
      const example = examples.find(ex => ex.prompt === prompt);
      setResponse(example?.response || 'Sample response generated...');
      setIsGenerating(false);
      onOpen();
      
      toast({
        title: "Response generated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
    }, 1500);
  }, [examples, onOpen, toast]);

  if (!examples?.length) {
    return null;
  }

  return (
    <>
      <MotionBox
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        mt={8}
      >
        <Card 
          bg={useColorModeValue('orange.50', 'orange.900')} 
          borderWidth="1px" 
          borderColor="orange.200"
          overflow="hidden"
        >
          <CardHeader pb={2}>
            <Heading size="md" color="orange.600">
              🚀 Interactive Examples
            </Heading>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Click on any example below to see it in action
            </Text>
          </CardHeader>
          <CardBody pt={0}>
            <Grid 
              templateColumns={{ 
                base: "1fr", 
                md: "repeat(auto-fit, minmax(280px, 1fr))" 
              }}
              gap={{ base: 3, md: 4 }}
            >
              {examples.map((example, index) => (
                <MotionCard
                  key={example.id}
                  whileHover={shouldReduceMotion ? {} : { 
                    scale: 1.02, 
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                  cursor="pointer"
                  onClick={() => handleTryPrompt(example.prompt)}
                  bg={useColorModeValue('white', 'gray.700')}
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.600')}
                  _hover={{ 
                    borderColor: 'orange.300',
                    transform: shouldReduceMotion ? 'none' : 'translateY(-2px)'
                  }}
                  transition="all 0.2s"
                  h="fit-content"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTryPrompt(example.prompt);
                    }
                  }}
                  aria-label={`Try example: ${example.prompt}`}
                >
                  <CardBody p={{ base: 3, md: 4 }}>
                    <VStack align="start" spacing={3}>
                      <Badge colorScheme="orange" variant="subtle" size="sm" fontSize="xs">
                        Example {index + 1}
                      </Badge>
                      <Text 
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium" 
                        noOfLines={{ base: 6, md: 4 }}
                        lineHeight="1.4"
                      >
                        {example.prompt}
                      </Text>
                      <Button
                        size="sm"
                        colorScheme="orange"
                        variant="ghost"
                        leftIcon={<FaPlay />}
                        isLoading={isGenerating && selectedPrompt === example.prompt}
                        loadingText="Generating..."
                        alignSelf="flex-start"
                        px={4}
                        py={2}
                        h="auto"
                        mt={2}
                        fontSize={{ base: "xs", md: "sm" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Try This
                      </Button>
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </Grid>
          </CardBody>
        </Card>
      </MotionBox>

      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={useBreakpointValue({ base: 'full', md: 'xl' })}
        scrollBehavior="inside"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent mx={{ base: 0, md: 4 }}>
          <ModalHeader>
            <Flex align="center">
              <Icon as={FaPlay} color="orange.500" mr={2} />
              Generated Response
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="start" spacing={6}>
              <Box w="full">
                <Text fontWeight="bold" color="orange.600" mb={2}>Prompt:</Text>
                <Box 
                  bg={useColorModeValue('gray.50', 'gray.700')} 
                  p={4} 
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderColor="orange.300"
                >
                  <Text fontSize="sm" lineHeight="1.5">
                    {selectedPrompt}
                  </Text>
                </Box>
              </Box>
              <Box w="full">
                <Text fontWeight="bold" color="orange.600" mb={2}>Response:</Text>
                <Box 
                  bg={useColorModeValue('orange.50', 'orange.900')} 
                  p={4} 
                  borderRadius="md" 
                  borderLeft="4px solid" 
                  borderColor="orange.500"
                >
                  <ReactMarkdown>{response}</ReactMarkdown>
                </Box>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 400);
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <MotionBox
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0 }}
          position="fixed"
          bottom={{ base: "20px", md: "30px" }}
          right={{ base: "20px", md: "30px" }}
          zIndex={999}
        >
          <IconButton
            onClick={scrollToTop}
            colorScheme="orange"
            size="lg"
            borderRadius="full"
            boxShadow="lg"
            icon={<FaArrowUp />}
            aria-label="Scroll to top"
            _hover={{ transform: shouldReduceMotion ? 'none' : 'translateY(-2px)' }}
            transition="transform 0.2s"
          />
        </MotionBox>
      )}
    </AnimatePresence>
  );
}

function OptimizedImage({ 
  src, 
  alt, 
  caption, 
  priority = false,
  maxHeight = "auto",
  fullWidth = false
}: {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  maxHeight?: string;
  fullWidth?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (imageError) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <AlertTitle>Image unavailable</AlertTitle>
        <AlertDescription>Failed to load: {alt}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box position="relative" w="full">
      {imageLoading && (
        <Skeleton 
          height={{ base: "200px", md: maxHeight === "auto" ? "400px" : maxHeight }}
          borderRadius="md" 
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={1}
        />
      )}
      <Image
        src={src}
        alt={alt}
        quality={85}
        priority={priority}
        fill={false}
        width={0}
        height={0}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
          borderRadius: '8px',
          opacity: imageLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
        sizes="(max-width: 480px) 100vw, (max-width: 768px) 95vw, (max-width: 1200px) 90vw, 1200px"
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
      {caption && !imageLoading && (
        <Text 
          fontSize={{ base: "xs", md: "sm" }}
          color={useColorModeValue('gray.600', 'gray.400')} 
          textAlign="center" 
          mt={3}
          fontStyle="italic"
          px={2}
        >
          {caption}
        </Text>
      )}
    </Box>
  );
}

function SimpleTeamSection({ team }: { team: Blog['team'] }) {
  const shouldReduceMotion = useReducedMotion();
  const borderColor = useColorModeValue('orange.200', 'orange.700');
  const headingColor = useColorModeValue('gray.800', 'orange.100');
  const bgColor = useColorModeValue('orange.50', 'orange.900');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  if (!team || (!team.students?.length && !team.advisors?.length && !team.contacts?.length)) {
    return null;
  }

  return (
    <MotionBox
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      mt={10}
      p={5}
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
    >
      <Heading as="h3" size="lg" mb={4} color={headingColor}>
        <Icon as={FaUser} mr={2} />
        Team
      </Heading>
      <VStack align="start" spacing={2.5}>
        {team.students && team.students.length > 0 && (
          <Box>
            <Text fontWeight="semibold" mb={1} fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
              Students:
            </Text>
            <Text fontSize="sm" lineHeight="1.4" color={textColor}>
              {team.students.map((s) => s.name).join(', ')}
            </Text>
          </Box>
        )}
        {team.advisors && team.advisors.length > 0 && (
          <Box>
            <Text fontWeight="semibold" mb={1} fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
              Advisors:
            </Text>
            <Text fontSize="sm" lineHeight="1.4" color={textColor}>
              {team.advisors.map((a) => a.name).join(', ')}
            </Text>
          </Box>
        )}
        {team.contacts && team.contacts.length > 0 && (
          <Box>
            <Text fontWeight="semibold" mb={1} fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
              Contact:
            </Text>
            <Text fontSize="sm" lineHeight="1.4" color={textColor}>
              {team.contacts.map((c, index) => (
                <Text as="span" key={c.name}>
                  {c.name}
                  {c.email && (
                    <Text as="span">
                      {' '}(
                      <Text 
                        as="a" 
                        href={`mailto:${c.email}`}
                        color={useColorModeValue('orange.600', 'orange.300')}
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {c.email}
                      </Text>
                      )
                    </Text>
                  )}
                  {index < team.contacts!.length - 1 ? ', ' : ''}
                </Text>
              ))}
            </Text>
          </Box>
        )}
      </VStack>
    </MotionBox>
  );
}

export default function BlogContentDisplay({ blog }: BlogContentDisplayProps) {
  const sectionsArray = getSectionsArray(blog.sections);
  const readingTime = getReadingTime(blog.markdown_content || '', sectionsArray);
  const [readingProgress, setReadingProgress] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const toast = useToast();
  
  const pageBg = useColorModeValue('orange.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const headingColor = useColorModeValue('orange.800', 'orange.200');
  const borderColor = useColorModeValue('orange.200', 'orange.700');
  const linkColor = useColorModeValue('orange.600', 'orange.300');
  const accentColor = useColorModeValue('orange.500', 'orange.400');

  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress(); 
    return () => window.removeEventListener('scroll', updateReadingProgress);
  }, []);

  const affiliationMap = blog.affiliations?.reduce(
    (map, aff) => ({ ...map, [aff.id]: aff.name }),
    {} as Record<string, string>,
  ) || {};

  const coverImageSrc = blog.image || blog.cover_image?.src;
  const coverImageAlt = blog.cover_image?.alt || `Cover image for ${blog.title}`;
  const coverImageCaption = blog.cover_image?.caption;

  const formattedTitle = formatTitle(blog.title);

  const handleCopyBibTeX = useCallback(() => {
    if (blog.bibtex) {
      navigator.clipboard.writeText(blog.bibtex).then(() => {
        toast({
          title: "BibTeX copied to clipboard!",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top-right"
        });
      }).catch(() => {
        toast({
          title: "Failed to copy BibTeX",
          status: "error",
          duration: 2000,
          isClosable: true,
          position: "top-right"
        });
      });
    }
  }, [blog.bibtex, toast]);

  return (
    <Box bg={pageBg} minH="100vh" position="relative">
      <Progress
        value={readingProgress}
        size="xs"
        colorScheme="orange"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1001}
        bg="transparent"
        sx={{
          '& > div': {
            transition: 'width 0.1s ease-out'
          }
        }}
      />

      <StickyNavigation title={formattedTitle} />

      <Box bg={cardBg} borderBottom="1px solid" borderColor={borderColor} py={12} px={4}>
        <Container maxW="container.lg" textAlign="center">
          <MotionBox
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={6}>
              <Heading 
                as="h1" 
                size={{ base: 'xl', md: '2xl' }} 
                color={headingColor} 
                mt={4}
                lineHeight="shorter"
                textAlign="center"
              >
                {formattedTitle}
              </Heading>
              
              <Text color={textColor} fontSize="md" suppressHydrationWarning>
                Published on{' '}
                <Text as="span" fontWeight="medium">
                  {new Date(blog.published_on).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                {' '} • {readingTime === '0 min read' ? '1 min read' : readingTime}
              </Text>
              
              {blog.authors && blog.authors.length > 0 && (
                <Text color={textColor} fontSize="md" textAlign="center">
                  <Text as="span" fontWeight="medium">By: </Text>
                  {blog.authors.map((author, index) => (
                    <Text as="span" key={author.name}>
                      {author.name}
                      {author.affiliationId && affiliationMap[author.affiliationId] && (
                        <Text as="span" fontSize="sm" color="gray.500">
                          {' '}({affiliationMap[author.affiliationId]})
                        </Text>
                      )}
                      {index < blog.authors!.length - 1 ? ', ' : ''}
                    </Text>
                  ))}
                </Text>
              )}
              
              {blog.publication_links && blog.publication_links.length > 0 && (
                <Flex 
                  direction={{ base: 'column', md: 'row' }}
                  gap={4} 
                  justify="center" 
                  align="center"
                  mt={6}
                  flexWrap="wrap"
                >
                  {blog.publication_links.map((link, index) => (
                    <MotionButton
                      key={index}
                      as="a"
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      bg={accentColor}
                      color="white"
                      _hover={{ bg: linkColor, transform: shouldReduceMotion ? 'none' : 'translateY(-1px)' }}
                      size="md"
                      borderRadius="md"
                      px={6}
                      leftIcon={<Icon as={getIconComponent(link.icon || 'external')} />}
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                      transition="all 0.2s"
                      minW={{ base: "200px", md: "auto" }}
                    >
                      {link.text}
                    </MotionButton>
                  ))}
                  {blog.bibtex && (
                    <MotionButton
                      bg={accentColor}
                      color="white"
                      _hover={{ bg: linkColor, transform: shouldReduceMotion ? 'none' : 'translateY(-1px)' }}
                      size="md"
                      borderRadius="md"
                      px={6}
                      leftIcon={<Icon as={FaCopy} />}
                      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                      onClick={handleCopyBibTeX}
                      transition="all 0.2s"
                      minW={{ base: "200px", md: "auto" }}
                    >
                      Copy BibTeX
                    </MotionButton>
                  )}
                </Flex>
              )}
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {coverImageSrc && (
        <MotionBox
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          my={{ base: 4, md: 8 }}
          px={{ base: 2, md: 0 }}
        >
          <Container maxW="container.lg">
            <Center>
              <Box
                boxShadow={{ base: "md", md: "xl" }}
                border="2px solid"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                w="full"
                maxW={{ base: "100%", sm: "95%", md: "900px" }}
              >
                <OptimizedImage
                  src={coverImageSrc}
                  alt={coverImageAlt}
                  caption={coverImageCaption}
                  priority={true}
                  maxHeight="auto"
                  fullWidth={false}
                />
              </Box>
            </Center>
          </Container>
        </MotionBox>
      )}

      <Container maxW="container.lg" my={12} px={4}>
        <MotionBox
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          bg={cardBg}
          p={{ base: 4, sm: 6, md: 8 }}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="xl"
        >
          <Button
            as={Link}
            href="/blog"
            variant="ghost"
            colorScheme="orange"
            leftIcon={<Icon as={FaChevronRight} transform="rotate(180deg)" />}
            mb={6}
            size="sm"
            _hover={{ bg: 'orange.50' }}
          >
            Back to all articles
          </Button>
          
          <Box
            className="prose"
            sx={{
              maxW: '75ch',
              mx: 'auto',
              color: textColor,
              lineHeight: '1.7',
              fontSize: { base: 'sm', md: 'md' },
              'h1, h2, h3, h4, h5, h6': {
                color: headingColor,
                mt: { base: 6, md: 8 },
                mb: { base: 3, md: 4 },
                lineHeight: '1.3',
                fontWeight: 'bold',
              },
              h1: { fontSize: { base: 'xl', md: '2xl' } },
              h2: { fontSize: { base: 'lg', md: 'xl' } },
              h3: { fontSize: { base: 'md', md: 'lg' } },
              h4: { fontSize: { base: 'sm', md: 'md' } },
              p: { 
                mb: 4, 
                lineHeight: '1.7', 
                fontSize: { base: 'sm', md: 'md' },
                color: textColor
              },
              strong: {
                fontWeight: 'bold',
                color: useColorModeValue('orange.700', 'orange.300'),
              },
              a: {
                color: linkColor,
                textDecoration: 'underline',
                fontWeight: 'medium',
                _hover: { 
                  textDecoration: 'none', 
                  color: accentColor,
                  bg: useColorModeValue('orange.50', 'orange.900'),
                  px: 1,
                  borderRadius: 'sm'
                },
              },
              'ul, ol': { 
                ml: 6, 
                mb: 4,
                '& li': {
                  mb: 2,
                  fontSize: { base: 'sm', md: 'md' }
                }
              },
              blockquote: {
                borderLeft: '4px solid',
                borderColor: accentColor,
                pl: 6,
                py: 2,
                my: 8,
                fontStyle: 'italic',
                color: textColor,
                bg: useColorModeValue('orange.50', 'orange.900'),
                borderRadius: 'md',
              },
              img: {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 'lg',
                boxShadow: 'lg',
                my: 8,
              },
              pre: {
                bg: useColorModeValue('gray.100', 'gray.800'),
                p: 6,
                borderRadius: 'lg',
                overflowX: 'auto',
                fontSize: 'xs',
                my: 8,
                border: '1px solid',
                borderColor: borderColor,
                lineHeight: '1.5',
              },
              'code:not(pre > code)': {
                bg: useColorModeValue('orange.100', 'orange.800'),
                px: 2,
                py: 1,
                borderRadius: 'sm',
                fontSize: '0.8em',
                color: useColorModeValue('orange.800', 'orange.200'),
                fontWeight: 'medium',
              },
              'pre > code': {
                background: 'none',
                padding: 0,
                color: 'inherit',
                fontSize: 'inherit',
              },
            }}
          >
            <ReactMarkdown>{blog.markdown_content}</ReactMarkdown>

            {sectionsArray.map((section, index) => (
              <MotionBox
                key={index}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                mt={8}
              >
                {section.heading && renderHeading(section.heading, section.heading_level || 'h2', headingColor)}
                
                {section.type === 'markdown' && section.content && (
                  <Box>
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <Heading as="h1" size={{ base: 'xl', md: '2xl' }} mb={4} color={headingColor} fontWeight="bold">
                            {children}
                          </Heading>
                        ),
                        h2: ({ children }) => (
                          <Heading as="h2" size={{ base: 'lg', md: 'xl' }} mb={3} color={headingColor} fontWeight="bold">
                            {children}
                          </Heading>
                        ),
                        h3: ({ children }) => (
                          <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb={2} color={headingColor} fontWeight="bold">
                            {children}
                          </Heading>
                        ),
                        p: ({ children }) => (
                          <Text mb={4} lineHeight="1.8" color={textColor} fontSize={{ base: 'sm', md: 'md' }}>
                            {children}
                          </Text>
                        ),
                        strong: ({ children }) => (
                          <Text 
                            as="span" 
                            fontWeight="bold" 
                            color={useColorModeValue('orange.700', 'orange.300')}
                            fontSize="inherit"
                          >
                            {children}
                          </Text>
                        ),
                        em: ({ children }) => (
                          <Text as="span" fontStyle="italic" color="inherit">
                            {children}
                          </Text>
                        ),
                        a: ({ href, children }) => (
                          <Text 
                            as="a" 
                            href={href} 
                            color={linkColor} 
                            textDecoration="underline"
                            fontWeight="medium"
                            _hover={{ 
                              textDecoration: 'none', 
                              color: accentColor,
                              bg: useColorModeValue('orange.50', 'orange.900'),
                              px: 1,
                              borderRadius: 'sm'
                            }}
                            target={href?.startsWith('http') ? '_blank' : undefined}
                            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                            transition="all 0.2s ease"
                          >
                            {children}
                          </Text>
                        ),
                        ul: ({ children }) => (
                          <Box as="ul" ml={6} mb={4} listStyleType="disc">
                            {children}
                          </Box>
                        ),
                        ol: ({ children }) => (
                          <Box as="ol" ml={6} mb={4} listStyleType="decimal">
                            {children}
                          </Box>
                        ),
                        li: ({ children }) => (
                          <Text as="li" mb={2} lineHeight="1.6" fontSize={{ base: 'sm', md: 'md' }}>
                            {children}
                          </Text>
                        ),
                        code: ({ children, className, ...props }) => {
                          const isBlock = className && /language-/.test(className);
                          return isBlock ? (
                            <Box
                              as="pre"
                              bg={useColorModeValue('gray.50', 'gray.800')}
                              border="1px solid"
                              borderColor={borderColor}
                              p={4}
                              borderRadius="md"
                              overflowX="auto"
                              fontSize="xs"
                              my={4}
                              fontFamily="mono"
                            >
                              <Text as="code" color={textColor} {...props}>
                                {children}
                              </Text>
                            </Box>
                          ) : (
                            <Text
                              as="code"
                              bg={useColorModeValue('orange.100', 'orange.800')}
                              color={useColorModeValue('orange.800', 'orange.200')}
                              px={2}
                              py={1}
                              borderRadius="sm"
                              fontSize="0.85em"
                              fontWeight="medium"
                              fontFamily="mono"
                              {...props}
                            >
                              {children}
                            </Text>
                          );
                        }
                      }}
                    >
                      {section.content}
                    </ReactMarkdown>
                  </Box>
                )}
                
                {section.type === 'table' && section.headers && section.rows && (
                  <Box my={8}>
                    <ResponsiveTable headers={section.headers} rows={section.rows} />
                  </Box>
                )}
                
                {section.type === 'examples' && section.items && (
                  <InteractivePromptDemo examples={section.items} />
                )}
                
                {section.type === 'image' && section.image?.src && (
                  <Box my={{ base: 4, md: 8 }} px={{ base: 2, md: 0 }}>
                    <Center>
                      <Box
                        w="full"
                        maxW={section.image.src.includes('indic-voices-dist') ? 
                          { base: "100%", md: "1200px" } : 
                          { base: "100%", md: "800px" }
                        }
                        border="1px solid"
                        borderColor={borderColor}
                        borderRadius="lg"
                        overflow="hidden"
                        boxShadow={{ base: "md", md: "lg" }}
                      >
                        <OptimizedImage
                          src={section.image.src}
                          alt={section.image.alt || 'Section image'}
                          caption={section.image.caption}
                          maxHeight="auto"
                          fullWidth={section.image.src.includes('indic-voices-dist')}
                        />
                      </Box>
                    </Center>
                  </Box>
                )}
              </MotionBox>
            ))}

            <SimpleTeamSection team={blog.team} />
          </Box>
        </MotionBox>
      </Container>

      <ScrollToTopButton />
    </Box>
  );
}

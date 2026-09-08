"use client";
//added new features

import { useQuery } from "react-query";
import {
  Container,
  Heading,
  Text,
  Spinner,
  Center,
  VStack,
  Box,
  Button,
  useColorModeValue,
  Skeleton,
  Badge,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  useBreakpointValue,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  IconButton,
  Tooltip,
  AspectRatio,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { 
  FaSearch, 
  FaCalendarAlt, 
  FaUser, 
  FaArrowRight, 
  FaBookOpen,
  FaTags,
  FaHome,
  FaClock
} from "react-icons/fa";
import { API_URL } from "../config";

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

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

// ✅ FIXED: Stricter validation - must have non-empty page_url
function validateBlogData(blog: any): blog is Blog {
  return blog && 
         typeof blog.id === 'number' && 
         typeof blog.title === 'string' &&
         typeof blog.page_url === 'string' &&
         blog.page_url.trim() !== ''; // ✅ Must be non-empty
}

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

// Enhanced hook for comprehensive image fallback logic
function useImageWithFallback(blog: Blog) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const imageSources = useMemo(() => {
    const sources: string[] = [];
    
    // Priority 1: Cover image (HIGHEST PRIORITY)
    if (blog.cover_image?.src) {
      sources.push(blog.cover_image.src);
    }
    
    // Priority 2: Main blog image
    if (blog.image) {
      sources.push(blog.image);
    }
    
    // Priority 3: Extract images from sections
    const sectionsArray = getSectionsArray(blog.sections);
    if (sectionsArray && sectionsArray.length > 0) {
      sectionsArray.forEach(section => {
        if (section.type === 'image' && section.image?.src) {
          sources.push(section.image.src);
        }
      });
    }
    
    // Priority 4: Extract images from markdown content
    if (blog.markdown_content) {
      const imageRegex = /!\[.*?\]\((.*?)\)/g;
      let match;
      while ((match = imageRegex.exec(blog.markdown_content)) !== null) {
        if (match[1] && match[1].trim()) {
          // Clean up the URL (remove quotes if present)
          const cleanUrl = match[1].trim().replace(/^["']|["']$/g, '');
          sources.push(cleanUrl);
        }
      }
    }
    
    // Remove duplicates and filter out empty strings
    return Array.from(new Set(sources.filter(src => src && src.trim() !== '')));
  }, [blog]);
  
  const currentImageSrc = imageSources[currentImageIndex] || null;
  
  const handleImageError = useCallback(() => {
    console.log(`Image failed to load: ${currentImageSrc}`);
    if (currentImageIndex < imageSources.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setImageError(false);
    } else {
      setImageError(true);
    }
  }, [currentImageIndex, imageSources.length, currentImageSrc]);
  
  return {
    imageSrc: currentImageSrc,
    imageError: imageError && currentImageIndex >= imageSources.length - 1,
    handleImageError,
    hasImages: imageSources.length > 0,
    imageAlt: blog.cover_image?.alt || `Cover image for ${blog.title}`,
    totalImages: imageSources.length,
    currentIndex: currentImageIndex
  };
}

function getReadingTime(content: string, sections?: any[]): string {
  const WORDS_PER_MINUTE = 225;
  
  let totalText = content || '';
  
  if (sections && Array.isArray(sections)) {
    sections.forEach(section => {
      if (section.heading) {
        totalText += ' ' + section.heading;
      }
      
      if (section.content) {
        totalText += ' ' + section.content;
      }
      
      if (section.type === 'table') {
        if (section.headers && Array.isArray(section.headers)) {
          totalText += ' ' + section.headers.join(' ');
        }
        if (section.rows && Array.isArray(section.rows)) {
          section.rows.forEach((row: string[]) => {
            if (Array.isArray(row)) {
              totalText += ' ' + row.join(' ');
            }
          });
        }
      }
      
      if (section.type === 'examples' && section.items && Array.isArray(section.items)) {
        section.items.forEach((item: { id: string; prompt: string; response: string }) => {
          if (item.prompt) totalText += ' ' + item.prompt;
          if (item.response) totalText += ' ' + item.response;
        });
      }
      
      if (section.image && section.image.caption) {
        totalText += ' ' + section.image.caption;
      }
    });
  }
  
  if (!totalText || totalText.trim().length === 0) {
    return "1 min read";
  }
  
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

function BlogCardSkeleton() {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("orange.100", "orange.800");

  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      bg={cardBg}
      borderColor={borderColor}
      height="auto"
      minHeight="400px"
      boxShadow="sm"
    >
      <AspectRatio ratio={16/9}>
        <Skeleton borderRadius="0" />
      </AspectRatio>
      <Box p={6} display="flex" flexDirection="column" gap={4}>
        <HStack justify="space-between">
          <Skeleton height="20px" width="80px" borderRadius="full" />
          <Skeleton height="16px" width="60px" />
        </HStack>
        <Skeleton height="24px" width="90%" />
        <VStack spacing={2} align="start" flex={1}>
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="80%" />
        </VStack>
        <Skeleton height="16px" width="120px" />
        <Skeleton height="40px" borderRadius="md" />
      </Box>
    </Box>
  );
}

function SearchAndFilter({ 
  searchTerm, 
  onSearchChange, 
  totalCount 
}: { 
  searchTerm: string; 
  onSearchChange: (value: string) => void;
  totalCount: number;
}) {
  const inputBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("orange.200", "orange.600");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box mb={12}>
      <VStack spacing={6}>
        <InputGroup maxW="500px" size="lg">
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="orange.400" />
          </InputLeftElement>
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            bg={inputBg}
            borderColor={borderColor}
            borderWidth="1px"
            borderRadius="md"
            fontSize="md"
            _hover={{ borderColor: "orange.300" }}
            _focus={{ 
              borderColor: "orange.400", 
              boxShadow: "0 0 0 1px orange.400" 
            }}
            _placeholder={{ color: textColor }}
          />
        </InputGroup>
        
        <HStack spacing={4} color={textColor} fontSize="sm">
          <HStack spacing={2}>
            <Icon as={FaBookOpen} />
            <Text fontWeight="medium">
              {totalCount} {totalCount === 1 ? 'article' : 'articles'}
            </Text>
          </HStack>
          {searchTerm && (
            <>
              <Divider orientation="vertical" h="20px" />
              <Text>
                Results for: <Text as="span" fontWeight="semibold" color="orange.500">"{searchTerm}"</Text>
              </Text>
            </>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}

function BlogCard({ blog, index }: { blog: Blog; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const { 
    imageSrc, 
    imageError, 
    handleImageError, 
    hasImages, 
    imageAlt,
    totalImages,
    currentIndex
  } = useImageWithFallback(blog);
  
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("orange.100", "orange.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const hoverBorderColor = useColorModeValue("orange.300", "orange.500");

  const readingTime = getReadingTime(blog.markdown_content, getSectionsArray(blog.sections));
  const authorNames = blog.authors?.map(author => author.name).join(", ") || "AI4Bharat Team";

  // ✅ ADDED: Safety check for invalid page_url
  if (!blog.page_url || blog.page_url.trim() === '') {
    console.error(`Blog ${blog.id} has invalid page_url:`, blog.page_url);
    return null;
  }

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
          {imageSrc && !imageError ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={handleImageError}
              quality={75}
              priority={index < 3}
            />
          ) : (
            <Center bg="orange.50">
              <VStack spacing={2}>
                <Icon as={FaBookOpen} fontSize="2xl" color="orange.400" />
                <Text 
                  color="orange.600" 
                  fontSize="sm" 
                  fontWeight="medium"
                  textAlign="center"
                  px={4}
                  noOfLines={2}
                >
                  {blog.title.length > 40 ? `${blog.title.substring(0, 40)}...` : blog.title}
                </Text>
                {process.env.NODE_ENV === 'development' && (
                  <Text fontSize="xs" color="orange.400">
                    {hasImages ? `${currentIndex + 1}/${totalImages} failed` : 'No images'}
                  </Text>
                )}
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
            href={`/blog/${blog.page_url}`}
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

// ✅ IMPROVED: Added comprehensive logging
const fetchBlogList = async (): Promise<Blog[]> => {
  const endpoint = `${API_URL}/news/`;

  try {
    if (!API_URL) {
      throw new Error('API_URL is not configured');
    }

    console.log('[fetchBlogList] Fetching from:', endpoint);

    const response = await fetch(endpoint, { 
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI4Bharat-Website-Builder/1.0',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blog list: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('[fetchBlogList] Raw blogs count:', data.length);
    
    // Validate and filter blog data with logging
    const validBlogs = Array.isArray(data) ? data.filter(blog => {
      const isValid = validateBlogData(blog);
      if (!isValid) {
        console.warn('[fetchBlogList] Filtered out invalid blog:', {
          id: blog?.id,
          title: blog?.title,
          page_url: blog?.page_url
        });
      }
      return isValid;
    }) : [];
    
    // Inject Bodhan ASR static blog
    const bodhanASRBlog: Blog = {
      id: 999001,
      title: "Indic-Transcribe ",
      description: "Indic-Transcribe is a 1.2B-parameter multilingual speech recognition family for 25 Indian languages.",
      published_on: "2026-09-08T00:00:00Z",
      image: "/static-blogs/bodhan-asr/images/bodhan_ai.jpg",
      related_link: null,
      markdown_content: "",
      page_url: "bodhan-asr",
      authors: [{ name: "Bodhan AI & AI4Bharat" }]
    };
    
    // Inject Bodhan TTS static blog
    const bodhanTTSBlog: Blog = {
      id: 999002,
      title: "Indic-Speak ",
      description: "A 3.36B language model where punctuation shapes timing, pauses, and emphasis.",
      published_on: "2026-09-08T00:00:00Z",
      image: "/static-blogs/bodhan-tts/images/indic-speak.png",
      related_link: null,
      markdown_content: "",
      page_url: "bodhan-tts",
      authors: [{ name: "Bodhan AI & AI4Bharat" }]
    };

    // Inject Bodhan MT static blog
    const bodhanMTBlog: Blog = {
      id: 999003,
      title: "Indic-Translate ",
      description: "State-of-the-art Machine Translation for India's many languages.",
      published_on: "2026-09-08T00:00:00Z",
      image: "/static-blogs/bodhan-mt/images/llm-translate.jpg",
      related_link: null,
      markdown_content: "",
      page_url: "bodhan-mt",
      authors: [{ name: "Bodhan AI & AI4Bharat" }]
    };

    // Inject Bodhan OCR static blog
    const bodhanOCRBlog: Blog = {
      id: 999004,
      title: "IndicOCR ",
      description: "State-of-the-art Document Parsing for India.",
      published_on: "2026-09-08T00:00:00Z",
      image: "/static-blogs/bodhan-ocr/images/indic-ocr.jpg",
      related_link: null,
      markdown_content: "",
      page_url: "bodhan-ocr",
      authors: [{ name: "Bodhan AI & AI4Bharat" }]
    };

    validBlogs.unshift(bodhanOCRBlog);
    validBlogs.unshift(bodhanMTBlog);
    validBlogs.unshift(bodhanTTSBlog);
    validBlogs.unshift(bodhanASRBlog);

    console.log('[fetchBlogList] Valid blogs count:', validBlogs.length);
    console.log('[fetchBlogList] Available page_urls:', 
      validBlogs.map(b => ({ id: b.id, page_url: b.page_url }))
    );
    
    return validBlogs;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

export default function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const shouldReduceMotion = useReducedMotion();
  const toast = useToast();
  
  const { data: blogList, isLoading, error, refetch } = useQuery<Blog[]>(
    ["fetchBlogList"],
    fetchBlogList,
    {
      staleTime: 5 * 60 * 1000, 
      cacheTime: 10 * 60 * 1000,
      onError: () => {
        toast({
          title: "Failed to load articles",
          description: "Please check your connection and try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );

  const filteredBlogs = useMemo(() => {
    if (!blogList) return [];
    if (!searchTerm.trim()) return blogList;

    const searchLower = searchTerm.toLowerCase();
    return blogList.filter(blog => 
      blog.title.toLowerCase().includes(searchLower) ||
      blog.description.toLowerCase().includes(searchLower) ||
      blog.authors?.some(author => 
        author.name.toLowerCase().includes(searchLower)
      )
    );
  }, [blogList, searchTerm]);

  const bgColor = useColorModeValue("orange.50", "gray.900");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const headingColor = useColorModeValue("gray.900", "white");

  const gridColumns = useBreakpointValue({
    base: 1,
    md: 2,
    lg: 3,
    xl: 3
  });

  if (isLoading) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="6xl" py={16} px={{ base: 4, md: 6 }}>
          <VStack spacing={8} align="center" mb={12}>
            <Heading
              as="h1"
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              textAlign="center"
              bgGradient="linear(to-r, orange.400, orange.600)"
              bgClip="text"
              fontWeight="bold"
            >
              AI4Bharat Blog
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              maxW="3xl"
              textAlign="center"
              color={textColor}
              lineHeight="relaxed"
            >
              Discover cutting-edge research and insights from the AI4Bharat community
            </Text>
          </VStack>
          
          <SimpleGrid columns={gridColumns} spacing={6} w="full">
            {Array.from({ length: 6 }).map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="6xl" py={16}>
          <Center h="60vh">
            <VStack spacing={6} textAlign="center">
              <Alert
                status="error"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                height="200px"
                borderRadius="lg"
                maxW="md"
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize="lg">
                  Unable to load articles
                </AlertTitle>
                <AlertDescription maxWidth="sm" fontSize="md">
                  {error instanceof Error && error.message.includes('API_URL') 
                    ? 'Configuration error. Please try again later.' 
                    : 'Please check your internet connection and try again.'
                  }
                </AlertDescription>
              </Alert>
              <Button
                colorScheme="orange"
                onClick={() => refetch()}
                size="lg"
                borderRadius="md"
                leftIcon={<Icon as={FaHome} />}
              >
                Try Again
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <MotionContainer 
        maxW="6xl" 
        py={16} 
        px={{ base: 4, md: 6 }}
        initial={shouldReduceMotion ? {} : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8} align="center" mb={12}>
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Heading
              as="h1"
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              textAlign="center"
              bgGradient="linear(to-r, orange.400, orange.600)"
              bgClip="text"
              fontWeight="bold"
              lineHeight="shorter"
            >
              AI4Bharat Blog
            </Heading>
          </motion.div>
          
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <Text
              fontSize={{ base: "md", md: "lg" }}
              maxW="3xl"
              textAlign="center"
              color={textColor}
              lineHeight="relaxed"
            >
              Discover cutting-edge research and insights from the AI4Bharat community. 
              Explore our latest work in AI for Indian languages and beyond.
            </Text>
          </motion.div>
        </VStack>

        {blogList && blogList.length > 0 && (
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              totalCount={filteredBlogs.length}
            />
          </motion.div>
        )}

        {blogList && blogList.length > 0 ? (
          filteredBlogs.length > 0 ? (
            <SimpleGrid columns={gridColumns} spacing={6} w="full">
              <AnimatePresence>
                {filteredBlogs.map((blog, index) => (
                  <BlogCard key={blog.id} blog={blog} index={index} />
                ))}
              </AnimatePresence>
            </SimpleGrid>
          ) : (
            <Center py={20}>
              <VStack spacing={6} textAlign="center">
                <Icon as={FaSearch} fontSize="4xl" color="orange.400" />
                <VStack spacing={2}>
                  <Heading size="lg" color={headingColor}>
                    No articles found
                  </Heading>
                  <Text color={textColor} maxW="md">
                    Try adjusting your search terms or browse all articles.
                  </Text>
                </VStack>
                <Button
                  colorScheme="orange"
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  borderRadius="md"
                >
                  Clear Search
                </Button>
              </VStack>
            </Center>
          )
        ) : (
          <Center py={20}>
            <VStack spacing={6} textAlign="center">
              <Icon as={FaBookOpen} fontSize="4xl" color="orange.400" />
              <VStack spacing={2}>
                <Heading size="lg" color={headingColor}>
                  Coming Soon
                </Heading>
                <Text color={textColor} maxW="md" textAlign="center">
                  We're working on bringing you amazing research content. 
                  Check back soon for the latest insights and innovations.
                </Text>
              </VStack>
            </VStack>
          </Center>
        )}
      </MotionContainer>
    </Box>
  );
}

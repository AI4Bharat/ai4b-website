//blogs rendering
"use client";

import { useState, useMemo } from "react";
import {
  Center,
  VStack,
  Box,
  Button,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  useBreakpointValue,
  Text,
  Heading,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { FaSearch, FaBookOpen } from "react-icons/fa";
import BlogCard from "./BlogCard"; // Import BlogCard component

// Blog interface (same as in Server Component)
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

// Main Client Component for rendering blogs with interactivity and animations
export default function ClientBlogsRenderer({ 
  initialBlogs, 
  headingColor, 
  textColor 
}: { 
  initialBlogs: Blog[]; 
  headingColor: string; 
  textColor: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const gridColumns = useBreakpointValue({
    base: 1,
    md: 2,
    lg: 3,
    xl: 3
  });
  const inputBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("orange.200", "orange.600");

  const filteredBlogs = useMemo(() => {
    if (!searchTerm.trim()) return initialBlogs;
    const searchLower = searchTerm.toLowerCase();
    return initialBlogs.filter(blog => 
      blog.title.toLowerCase().includes(searchLower) ||
      blog.description.toLowerCase().includes(searchLower) ||
      blog.authors?.some(author => 
        author.name.toLowerCase().includes(searchLower)
      )
    );
  }, [initialBlogs, searchTerm]);

  return (
    <>
      {initialBlogs.length > 0 ? (
        <>
          {/* Search and Filter UI */}
          <Box mb={12}>
            <VStack spacing={6}>
              <InputGroup maxW="500px" size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaSearch} color="orange.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'}
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {filteredBlogs.length > 0 ? (
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
          )}
        </>
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
    </>
  );
}

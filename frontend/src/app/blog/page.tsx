//blogs sections page
import {
  Container,
  Heading,
  Text,
  Center,
  VStack,
  Box,
  Button,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { FaHome } from "react-icons/fa";
import { API_URL } from "../config"; 
import ClientBlogsRenderer from "../../../components/ClientBlogsRenderer"; 

export const revalidate = 60; 

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

async function fetchBlogList(): Promise<Blog[]> {
  const endpoint = `${API_URL}/news/`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch blog list: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
}

export default async function BlogsPage() {
  let blogList: Blog[] = [];
  let error: Error | null = null;

  try {
    blogList = await fetchBlogList();
  } catch (err) {
    error = err instanceof Error ? err : new Error('Unknown error');
  }

  const bgColor = "orange.50";
  const textColor = "gray.700";
  const headingColor = "gray.900";

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
                  Please check your internet connection and try again.
                </AlertDescription>
              </Alert>
              <Button
                colorScheme="orange"
                size="lg"
                borderRadius="md"
                leftIcon={<Icon as={FaHome} />}
                href="/"
                as="a"
              >
                Go Home
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

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
            lineHeight="shorter"
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
            Discover cutting-edge research and insights from the AI4Bharat community. 
            Explore our latest work in AI for Indian languages and beyond.
          </Text>
        </VStack>

        <ClientBlogsRenderer 
          initialBlogs={blogList} 
          headingColor={headingColor} 
          textColor={textColor} 
        />
      </Container>
    </Box>
  );
}

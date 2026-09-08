"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Progress,
  Container,
  Flex,
  Button,
  Icon,
  Text,
  Heading,
  VStack,
  HStack,
  useColorModeValue,
  IconButton,
  Badge,
  Center,
  Image,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { FaHome, FaArrowUp, FaChevronRight, FaGithub, FaPlay, FaBook } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";

const MotionBox = motion(Box);

// ── metadata extracted from page-data JSON ──────────────────────────────────
const POST = {
  title: "Indic-Transcribe: Built for the way India actually speaks",
  date: "September 8, 2026",
  readMin: 15,
  author: "Bodhan AI & AI4Bharat",
  links: [
    {
      label: "Core on Hugging Face",
      url: "https://huggingface.co/bodhan-ai/indic-transcribe-core",
      icon: "hf",
    },
    {
      label: "Flex on Hugging Face",
      url: "https://huggingface.co/bodhan-ai/indic-transcribe-flex",
      icon: "hf",
    },
    { label: "GitHub", url: "#", icon: "github", soon: true },
    {
      label: "Demo",
      url: "https://www.youtube.com/watch?v=5GuSEcs4ucc&t=7s",
      embed: "https://www.youtube.com/embed/5GuSEcs4ucc?start=7&rel=0",
      icon: "play",
    },
    { label: "Documentation", url: "#", icon: "docs", soon: true },
  ],
};

// ── Reading progress bar ─────────────────────────────────────────────────────
function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
      );
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <Progress
      value={progress}
      size="xs"
      colorScheme="orange"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1001}
      bg="transparent"
      sx={{ "& > div": { transition: "width 0.1s ease-out" } }}
    />
  );
}

const BG_COLORS = ['#F7C99B', '#EADFD0', '#F3D2A0', '#E4D8C8', '#FBE3CA', '#DCC7AE', '#F3D2A0', '#EFB187', '#E4D8C8'];
const FG_COLORS = ['#E28B5A', '#5FA79C', '#DDA45F', '#E9A27C', '#78B5A9', '#E3B27E', '#D97F5F', '#93C1B2', '#EBBE86'];

function HeroWave({ mouseX, mouseY }: { mouseX: any, mouseY: any }) {
  const isReduced = useReducedMotion();
  const [seed, setSeed] = useState(1);

  useEffect(() => {
    if (isReduced) return;
    const interval = setInterval(() => {
      setSeed(Math.ceil(Math.random() * 99));
    }, 200);
    return () => clearInterval(interval);
  }, [isReduced]);

  return (
    <Box position="absolute" inset={0} pointerEvents="none" zIndex={1} overflow="hidden" opacity={0.85}>
      <motion.svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ width: "100%", height: "100%", display: "block" }}>
        <defs>
          <filter id="hc-f" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="28" />
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <mask id="hc-m">
            <g id="m">
              {BG_COLORS.map((_, i) => {
                const targetX = 400 - (i % 3) * 400;
                const targetY = 400 - Math.floor(i / 3) * 400;
                return (
                  <motion.circle
                    key={`m-${i}`} r={100} fill="#fff"
                    initial={isReduced ? { cx: 200 + (i % 3) * 200, cy: 200 + Math.floor(i / 3) * 200 } : { cx: 400, cy: 400 }}
                    animate={{ cx: 200 + (i % 3) * 200, cy: 200 + Math.floor(i / 3) * 200 }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    style={isReduced ? {} : {
                      x: useTransform(mouseX, [0, 0.5, 1], [0, targetX, 0]),
                      y: useTransform(mouseY, [0, 0.5, 1], [0, targetY, 0])
                    }}
                  />
                );
              })}
            </g>
          </mask>
        </defs>

        <g id="bg">
          {BG_COLORS.map((color, i) => {
            const targetX = 400 - (i % 3) * 400;
            const targetY = 400 - Math.floor(i / 3) * 400;
            return (
              <motion.circle
                key={`bg-${i}`} r={100} fill={color}
                initial={isReduced ? { cx: 200 + (i % 3) * 200, cy: 200 + Math.floor(i / 3) * 200 } : { cx: 400, cy: 400 }}
                animate={{ cx: 200 + (i % 3) * 200, cy: 200 + Math.floor(i / 3) * 200 }}
                transition={{ duration: 3, ease: "easeInOut" }}
                style={isReduced ? {} : {
                  x: useTransform(mouseX, [0, 0.5, 1], [0, targetX, 0]),
                  y: useTransform(mouseY, [0, 0.5, 1], [0, targetY, 0])
                }}
              />
            );
          })}
        </g>

        <g id="masked" mask="url(#hc-m)">
          <g filter="url(#hc-f)">
            {FG_COLORS.map((_, i) => (
              <motion.circle
                key={`shadow-${i}`} r={95} fill="#5C403352"
                cx={200 + (i % 3) * 200} cy={200 + Math.floor(i / 3) * 200}
                x={-5} y={12}
                initial={{ y: i % 2 ? -200 : 200 }}
                animate={{ y: i % 2 ? 200 : -200 }}
                transition={isReduced ? {} : { duration: 2, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
              />
            ))}
          </g>
          <g>
            {FG_COLORS.map((color, i) => (
              <motion.circle
                key={`fg-${i}`} r={100} fill={color}
                cx={200 + (i % 3) * 200} cy={200 + Math.floor(i / 3) * 200}
                initial={{ y: i % 2 ? -200 : 200 }}
                animate={{ y: i % 2 ? 200 : -200 }}
                transition={isReduced ? {} : { duration: 2, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
              />
            ))}
          </g>
        </g>
      </motion.svg>
    </Box>
  );
}

// ── Sticky nav (appears after 200 px scroll) ─────────────────────────────────
function StickyNav() {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const navBg = useColorModeValue(
    "rgba(255,255,255,0.95)",
    "rgba(26,32,44,0.95)"
  );
  const borderColor = useColorModeValue("orange.200", "orange.700");
  const textColor = useColorModeValue("gray.700", "gray.300");

  useEffect(() => {
    const handle = () => setIsVisible(window.scrollY > 200);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

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
                {POST.title}
              </Text>
            </Flex>
          </Container>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}

// ── Scroll-to-top FAB ────────────────────────────────────────────────────────
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handle = () => setIsVisible(window.pageYOffset > 400);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  const scrollToTop = useCallback(
    () => window.scrollTo({ top: 0, behavior: "smooth" }),
    []
  );

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
            _hover={{ transform: shouldReduceMotion ? "none" : "translateY(-2px)" }}
            transition="transform 0.2s"
          />
        </MotionBox>
      )}
    </AnimatePresence>
  );
}

// ── Link icon helper ─────────────────────────────────────────────────────────
function LinkIcon({ icon }: { icon: string }) {
  if (icon === "hf") return <Text as="span" fontSize="1.15em">🤗</Text>;
  if (icon === "github") return <FaGithub color="gray" />;
  if (icon === "play") return <FaPlay color="#E25822" style={{ fontSize: "0.8em" }} />;
  if (icon === "docs") return <FaBook color="gray" />;
  return null;
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function BodhanASRBlogPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Mouse tracking for the cover background
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  // colours — identical to BlogContentDisplay.tsx
  const pageBg = useColorModeValue("orange.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("orange.800", "orange.200");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const borderColor = useColorModeValue("orange.200", "orange.700");
  const accentColor = useColorModeValue("orange.500", "orange.400");
  const linkColor = useColorModeValue("orange.600", "orange.300");

  const [sections, setSections] = useState<{ id: string, title: string, y: number }[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");

  const injectArticleStyles = useCallback((doc: Document) => {
    if (!doc.getElementById("ai4b-injected")) {
      const style = doc.createElement("style");
      style.id = "ai4b-injected";
      style.textContent = `
        html, body { background: transparent !important; margin: 0 !important; padding: 0 !important; }
        /* Hide the Bodhan hero — title / cover is now rendered by the Next.js wrapper */
        header.hero, .hero { display: none !important; }
        /* Hide the blog's own progress bar & internal TOC */
        .progress-bar { display: none !important; }
        .toc-rail, .toc-hover-zone, .toc-pills { display: none !important; }
        footer { display: none !important; }
        /* Remove top padding that was designed for the hero */
        .research-article-column:first-child { padding-top: 0 !important; }
        .research-type-body { font-size: 1rem !important; line-height: 1.75 !important; }
        .research-type-lead { font-size: 1.0625rem !important; }
        .research-type-h2  { font-size: clamp(1.35rem, 2.4vw, 1.875rem) !important; }
        .research-type-h3  { font-size: 1.0625rem !important; }
        .research-article-column { margin: 0 auto !important; max-width: 800px !important; }

        /* Simulate the staggered entrance animation from BlogContentDisplay */
        @keyframes sectionFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .research-prose > section, .research-prose > .chart-card, .research-prose > .editorial-card {
          animation: sectionFadeUp 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .research-prose > *:nth-child(1) { animation-delay: 0.1s; }
        .research-prose > *:nth-child(2) { animation-delay: 0.2s; }
        .research-prose > *:nth-child(3) { animation-delay: 0.3s; }
        .research-prose > *:nth-child(4) { animation-delay: 0.4s; }
        .research-prose > *:nth-child(5) { animation-delay: 0.5s; }
        .research-prose > *:nth-child(6) { animation-delay: 0.6s; }
        .research-prose > *:nth-child(n+7) { animation-delay: 0.7s; }
      `;
      doc.head.appendChild(style);
      if (doc.defaultView) {
        doc.defaultView.scrollTo(0, 0);
      }
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe?.contentDocument) {
      injectArticleStyles(iframe.contentDocument);
    }
  }, [injectArticleStyles]);

  // Auto-resize iframe height and extract sections using polling
  useEffect(() => {
    const interval = setInterval(() => {
      const iframe = iframeRef.current;
      if (iframe?.contentDocument) {
        const doc = iframe.contentDocument;
        injectArticleStyles(doc);
        const body = doc.body;
        if (body) {
          const targetEl = (doc.getElementById('root') || doc.querySelector('.research-page') || doc.querySelector('.column') || body) as HTMLElement;
          const measuredH = (targetEl ? targetEl.offsetHeight : body.offsetHeight) + 60;
          const currentH = parseInt(iframe.style.height || "0", 10);
          if (measuredH > 300 && Math.abs(currentH - measuredH) > 15) {
            iframe.style.height = `${measuredH}px`;
          }
        }

        // Extract sections if not done yet
        setSections(prev => {
          if (prev.length > 0) return prev;
          const extractedSections = Array.from(iframe.contentDocument!.querySelectorAll('section[id]')).map((s: any) => {
            const titleAttr = s.getAttribute('data-toc');
            const titleEl = s.querySelector('h2') || s.querySelector('h3');
            let title = titleAttr || (titleEl ? titleEl.innerText : s.id);
            title = title.replace(/^[0-9]+\s*/, '');
            return {
              id: s.id,
              title: title,
              y: s.offsetTop
            };
          }).filter(s => s.title && s.title !== s.id && s.title !== 'intro');
          return extractedSections.length > 0 ? extractedSections : prev;
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, [injectArticleStyles]);

  // Track active section based on scroll
  useEffect(() => {
    if (sections.length === 0) return;
    const handleScroll = () => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) return;
      
      const iframeRect = iframe.getBoundingClientRect();
      let currentId = sections[0]?.id;
      
      for (const section of sections) {
        const el = iframe.contentDocument.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) continue;
          const topInViewport = iframeRect.top + rect.top;
          
          if (topInViewport <= 180) {
            currentId = section.id;
          }
        }
      }
      setActiveSection(currentId || "");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <Box bg={pageBg} minH="100vh" position="relative">
      <ReadingProgressBar />
      <StickyNav />

      {/* ── 1. TITLE / META SECTION — matches IndicVoices white header ─── */}
      <Box
        bg={cardBg}
        borderBottom="1px solid"
        borderColor={borderColor}
        py={12}
        px={4}
      >
        <Container maxW="container.lg" textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <VStack spacing={6}>
              <Heading
                as="h1"
                size={{ base: "xl", md: "2xl" }}
                color={headingColor}
                mt={4}
                lineHeight="shorter"
                textAlign="center"
                fontFamily="Crimson Text, serif"
              >
                {POST.title}
              </Heading>

              <Text color={textColor} fontSize="md" suppressHydrationWarning>
                Published on{" "}
                <Text as="span" fontWeight="medium">
                  {POST.date}
                </Text>{" "}
                &bull; {POST.readMin} min read
              </Text>

              <Text color={textColor} fontSize="md">
                <Text as="span" fontWeight="medium">By: </Text>
                {POST.author}
              </Text>

              {/* publication links — white pill style with modal integration */}
              <Flex
                direction={{ base: "column", md: "row" }}
                gap={3}
                justify="center"
                align="center"
                mt={2}
                flexWrap="wrap"
              >
                {POST.links.map((link) => (
                  <Button
                    key={link.label}
                    as="a"
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    bg="white"
                    color={textColor}
                    border="1px solid"
                    borderColor="orange.200"
                    borderRadius="full"
                    size="sm"
                    px={4}
                    _hover={link.url === "#" ? {} : { bg: "gray.50", transform: "translateY(-1px)", boxShadow: "sm" }}
                    leftIcon={<LinkIcon icon={link.icon} />}
                    isDisabled={link.url === "#"}
                    opacity={link.url === "#" ? 0.6 : 1}
                    transition="all 0.2s"
                    onClick={link.icon === "play" ? (e) => { e.preventDefault(); onOpen(); } : undefined}
                    cursor={link.url === "#" ? "default" : "pointer"}
                    boxShadow="xs"
                    minW={{ base: "200px", md: "auto" }}
                  >
                    <Text as="span" fontSize="sm" fontWeight="500">{link.label}</Text>
                    {link.url === "#" && (
                      <Text as="span" ml={1} fontSize="0.65em" color="gray.500" fontWeight="bold" letterSpacing="0.06em">
                        SOON
                      </Text>
                    )}
                  </Button>
                ))}
              </Flex>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* ── 2. COVER IMAGE — matches IndicVoices cover image section ──── */}
      <MotionBox
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0, scale: 0.97 },
          show: {
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.7,
              delay: 0.2,
              staggerChildren: 0.1,
              delayChildren: 0.3,
            },
          },
        }}
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
              bg="linear-gradient(90deg, #FBE3CA 0%, #FFF9F1 38%, #FFF9F1 62%, #EAF4EE 100%)"
              p={{ base: 8, md: 12 }}
              textAlign="center"
              position="relative"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <HeroWave mouseX={smoothMouseX} mouseY={smoothMouseY} />
              <Box className="hero-scrim" position="absolute" inset={0} pointerEvents="none" zIndex={2} bg="radial-gradient(ellipse 52% 80% at 50% 50%, rgba(255, 255, 255, 0.9) 30%, rgba(255, 255, 255, 0.62) 56%, rgba(255, 255, 255, 0) 82%)" />

              <Box position="relative" zIndex={3}>
                <MotionBox variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}>
                  <Image
                    src="/static-blogs/bodhan-asr/images/bodhan_mark.png"
                    alt="Bodhan AI — Indic-Transcribe"
                    maxH="120px"
                    mx="auto"
                    mb={4}
                  />
                </MotionBox>
                <MotionBox variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}>
                  <Heading
                    as="h2"
                    size={{ base: "lg", md: "xl" }}
                    color={headingColor}
                    fontFamily="Crimson Text, serif"
                    mb={3}
                  >
                    Indic-Transcribe
                  </Heading>
                </MotionBox>
                <MotionBox variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}>
                  <Text color={textColor} fontSize={{ base: "sm", md: "md" }} maxW="42ch" mx="auto" lineHeight="1.75">
                    A 1.2B-parameter multilingual ASR family for 27 Indian languages,
                    covering accents, dialects, and code-mixed speech.
                  </Text>
                </MotionBox>
                {/* publication links — moved inside cover and styled as original pills */}

                {/* stat strip */}
                <HStack
                  spacing={{ base: 4, md: 10 }}
                  justify="center"
                  mt={6}
                  flexWrap="wrap"
                  gap={3}
                >
                  {[
                    { num: "27", lbl: "Languages" },
                    { num: "1.2B", lbl: "Parameters" },
                    { num: "Speech → text", lbl: "Modality" },
                    { num: "Open", lbl: "Indic Open License" },
                  ].map((s) => (
                    <MotionBox
                      key={s.lbl}
                      variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
                    >
                      <VStack spacing={0}>
                        <Text
                          fontSize={{ base: "xl", md: "2xl" }}
                          fontWeight="bold"
                          color="orange.600"
                          fontFamily="Crimson Text, serif"
                        >
                          {s.num}
                        </Text>
                        <Text
                          fontSize="xs"
                          textTransform="uppercase"
                          letterSpacing="wide"
                          color={textColor}
                          fontWeight="medium"
                        >
                          {s.lbl}
                        </Text>
                      </VStack>
                    </MotionBox>
                  ))}
                </HStack>
              </Box>
            </Box>
          </Center>
        </Container>
      </MotionBox>

      {/* ── 3. CONTENT CARD — matches IndicVoices content card ───────── */}
      <Container id="hear" maxW="100%" mb={16} px={0}>
        <Flex justify="center" w="100%" px={{ base: 2, md: 4 }}>
          {/* External Sidebar Topic Navigator */}
          <Box
            w="240px"
            display={{ base: "none", xl: "block" }}
            flexShrink={0}
            mr={{ base: 4, xl: 8 }}
          >
            {sections.length > 0 && (
              <Box
                position="sticky"
                top="100px"
                pt={6}
                maxH="calc(100vh - 120px)"
                overflowY="auto"
                css={{
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: '4px' },
                }}
              >
                <VStack align="flex-start" spacing={4} pr={2}>
                  <Text fontSize="sm" fontWeight="600" color={textColor} textTransform="uppercase" letterSpacing="0.05em" mb={2}>
                    Contents
                  </Text>
                  {sections.map((sec) => (
                    <Box
                      key={sec.id}
                      as="button"
                      onClick={() => {
                        const iframe = iframeRef.current;
                        const el = iframe?.contentDocument?.getElementById(sec.id);
                        if (el && iframe) {
                          const rect = el.getBoundingClientRect();
                          const iframeRect = iframe.getBoundingClientRect();
                          const targetY = window.scrollY + iframeRect.top + rect.top - 90;
                          window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
                          setActiveSection(sec.id);
                        }
                      }}
                      textAlign="left"
                      fontSize="sm"
                      fontWeight={activeSection === sec.id ? "600" : "400"}
                      color={activeSection === sec.id ? accentColor : textColor}
                      opacity={activeSection === sec.id ? 1 : 0.6}
                      _hover={{ opacity: 1, color: accentColor }}
                      transition="all 0.2s"
                      position="relative"
                      pl={4}
                    >
                      {activeSection === sec.id && (
                        <Box position="absolute" left={0} top="50%" transform="translateY(-50%)" w="4px" h="4px" borderRadius="full" bg={accentColor} />
                      )}
                      <Text noOfLines={2} lineHeight="1.3">{sec.title}</Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>

          <MotionBox
            w="100%"
            maxW="960px"
            flexShrink={1}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            bg={useColorModeValue("#FFF9F0", "gray.700")}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="xl"
            overflow="hidden"
          >
            {/* Back button — same as IndicVoices */}
            <Box px={{ base: 4, md: 8 }} pt={{ base: 4, md: 6 }} pb={{ base: 6, md: 10 }}>
              <Button
                as={Link}
                href="/blog"
                variant="ghost"
                colorScheme="orange"
                leftIcon={<Icon as={FaChevronRight} transform="rotate(180deg)" />}
                size="sm"
                _hover={{ bg: "orange.50" }}
              >
                Back to all articles
              </Button>
            </Box>

            {/* iframe — hero + progress bar hidden via onLoad CSS injection */}
            <iframe
              ref={iframeRef}
              src="/static-blogs/bodhan-asr/bodhan-asr.html"
              onLoad={handleIframeLoad}
              style={{
                width: "100%",
                minHeight: "80vh",
                border: "none",
                display: "block",
              }}
              scrolling="no"
              title="Indic-Transcribe — Bodhan AI"
            />
          </MotionBox>

          {/* Right Spacer (to keep Content Card perfectly centered) */}
          <Box w="240px" display={{ base: "none", xl: "block" }} flexShrink={0} ml={{ base: 4, xl: 8 }} />
        </Flex>
      </Container>

      <ScrollToTopButton />

      {/* Video Demo Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay bg="rgba(44, 36, 28, 0.82)" backdropFilter="blur(4px)" />
        <ModalContent bg="transparent" boxShadow="none" my={4}>
          <ModalCloseButton color="white" bg="rgba(44, 36, 28, 0.7)" border="1px solid rgba(255, 255, 255, 0.35)" borderRadius="full" _hover={{ bg: "orange.500", borderColor: "orange.500" }} zIndex={2} />
          <ModalBody p={0} borderRadius="14px" overflow="hidden" bg="black" boxShadow="0 18px 60px rgba(0, 0, 0, 0.45)">
            <Box position="relative" width="100%" paddingTop="56.25%">
              <iframe
                src={(POST.links.find(l => l.icon === 'play') as any)?.embed || ""}
                title="Demo video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

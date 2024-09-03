"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Container,
  Stack,
  Flex,
  Heading,
  Text,
  Button,
  chakra,
  Box,
  Image,
  Code,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { API_URL } from "@/app/config";
import axios from "axios";
import { useEffect, useState } from "react";
import ArticleHero from "../ArticleHero";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";

const blogPost = `
### What are some of the developments in the Indic-LLM World?

The advent of Large Language Models (LLMs), especially ChatGPT, marked a revolutionary leap in how a layperson can interact with and engage with AI. It brought the power of NLP and intelligence into the hands of the masses by transforming interactions from command-based exchanges to conversational dialogues.

Now, while English-speaking users have experienced their “ChatGPT moment,” India eagerly awaits its turn. Despite being a nation of great linguistic diversity and vibrant cultural heritage, technological advancements (like ChatGPT) remain largely inaccessible to most of its populace. Large Language Models (LLMs) can revolutionize the lives of millions by removing the barriers for those who are technologically unaware. An India-centric LLM could democratize access to information, services, and opportunities by enabling interactions in local languages. A case in point is the Jugalbandi bot and the PM Kissan bot. It would be a leap towards inclusivity, ensuring that the benefits of these models are not confined to an educated elite.

The journey for IndicLLMs began with the launch of IndicBERT in 2020, which has since amassed over 400K downloads from Hugging Face. IndicBERT was primarily focused on Natural Language Understanding (NLU), while IndicBART, introduced in 2021, aimed to cater to Natural Language Generation. Both models were pretrained from scratch, utilizing the limited data and model scale available, thanks to generous grants from EkStep Foundation and Nilekani Philanthropies. However, with the introduction of large open models like Llama, Llama-2, and Mistral, the emphasis has shifted towards adapting these models for Indic languages. Various initiatives have been undertaken to develop both Base and Chat models for different languages, including OpenHathi (Base), Airavata (Chat), Gajendra-v0.1 (Chat), Kan-LLaMA, odia_llama2, tamil_llama, among others (GitHub link).

The approach these models employ involves building on top of the existing pretrained English-only models (typically Llama-2), by adapting them for Indic languages. This adaptation process includes extending the tokenizer and the embedding layer, followed by one or more rounds of continual pretraining, using data from existing multilingual corpora like mc4, OSCAR, Roots, etc., to develop the Base models. When it comes to creating Chat models, the process typically involves finetuning the various Base models (both English and Indic) using translated versions of existing English datasets like Dolly, OpenAssistant, UltraChat, etc.

While these models often demonstrate reasonably good language generation capabilities, they still fall short in factuality (source). This highlights one of the biggest open problems in building Indic models by adapting English models, i.e., the effective cross-lingual knowledge transfer from English. Moreover, when comparing their performance on Indic languages (source) with closed-source models like GPT-3.5 and GPT-4, it’s clear that these models have a considerable distance to go in terms of improvement. This raises the following question: If models like GPT-3.5 and GPT-4 can perform well in Indian languages, why do we need Indic-only models? Why not just use these models directly? Or consider the translate-test approach, where we first translate the prompt into English, get the output from the model, and then translate the answer back to the original language.
`;

const newTheme = {
  h1: (props: any) => {
    const { children } = props;
    return (
      <Heading marginBottom={5} size="3xl">
        {children}
      </Heading>
    );
  },
  h2: (props: any) => {
    const { children } = props;
    return (
      <Heading marginBottom={5} size="2xl">
        {children}
      </Heading>
    );
  },
  h3: (props: any) => {
    const { children } = props;
    return (
      <Heading marginBottom={5} size="xl">
        {children}
      </Heading>
    );
  },
  h4: (props: any) => {
    const { children } = props;
    return (
      <Heading marginBottom={5} size="md">
        {children}
      </Heading>
    );
  },
  p: (props: any) => {
    const { children } = props;
    return (
      <Text mb={10} fontSize={"xl"}>
        {children}
      </Text>
    );
  },
  code: (props: any) => {
    const { children } = props;
    return (
      <Code p={5} mb={3} borderRadius={15}>
        {children}
      </Code>
    );
  },
};

const fetchArticle = async (slug: string) => {
  try {
    const response = await axios.get(`${API_URL}/news/${slug}/`, {});
    return response.data;
  } catch (error) {
    console.error("Error fetching tool:", error);
    return [];
  }
};

export default function ArticleComponent({ slug }: { slug: string }) {
  const [article, setArticle] = useState({
    title: "",
    description: "",
    published_on: "",
    image: "",
    related_link: "",
    markdown_content: "",
  });
  const { isLoading, error, data } = useQuery(["fetchTool", slug], () =>
    fetchArticle(Array.isArray(slug) ? slug[0] : slug)
  );

  useEffect(() => {
    if (error || isLoading) {
      setArticle({
        title: "",
        description: "",
        published_on: "",
        image: "",
        related_link: "",
        markdown_content: "",
      });
    } else {
      setArticle(data);
    }
  }, [error, data, isLoading]);

  return (
    <Box borderColor={"gray"} p={5}>
      <ArticleHero
        title={article.title}
        image={article.image}
        description={article.description}
        link={article.related_link !== null ? article.related_link : ""}
      />
      <Box m={3} borderWidth={2} borderRadius={15} p={7}>
        {article.markdown_content !== "" ? (
          <ReactMarkdown
            components={ChakraUIRenderer(newTheme)}
            children={article.markdown_content}
            skipHtml
          />
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
}

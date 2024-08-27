"use client";
import React from "react";
import { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Select,
  Textarea,
  Button,
  Card,
  HStack,
  VStack,
  Switch,
} from "@chakra-ui/react";
import { LANGUAGE_CODE_NAMES } from "@/app/config";
import axios from "axios";

const fetchTranslation = async ({
  sourceLanguage,
  targetLanguage,
  input,
  task,
  serviceId,
}: {
  sourceLanguage: string;
  targetLanguage: string;
  input: string;
  task: string;
  serviceId: string;
}) => {
  try {
    const response = await axios.post(`/api/inference`, {
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      input: input,
      task: task,
      serviceId: serviceId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching inference:", error);
    return {};
  }
};

interface LanguageCodeNames {
  [key: string]: string;
}

export default function NMT({
  sourceLanguages = [],
  targetLanguages = [],
  serviceId,
}: {
  sourceLanguages: Array<string>;
  targetLanguages: Array<string>;
  serviceId: string;
}) {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("hi");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  return (
    <Card borderWidth={1} borderColor={"a4borange"} boxShadow={"2xl"} p={5}>
      <FormControl>
        <VStack>
          <HStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>
                Select Source Language:
              </FormLabel>
              <Select
                value={sourceLanguage}
                onChange={(event) => setSourceLanguage(event.target.value)}
              >
                {sourceLanguages.length === 0 ? (
                  <></>
                ) : (
                  sourceLanguages.map((language, index) => (
                    <option key={index} value={language}>
                      {(LANGUAGE_CODE_NAMES as LanguageCodeNames)[language]}
                    </option>
                  ))
                )}
              </Select>
            </VStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>
                Select Target Language:
              </FormLabel>
              <Select
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
              >
                {targetLanguages.length === 0 ? (
                  <></>
                ) : (
                  targetLanguages.map((language, index) => (
                    <option key={index} value={language}>
                      {(LANGUAGE_CODE_NAMES as LanguageCodeNames)[language]}
                    </option>
                  ))
                )}
              </Select>
            </VStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>
                Enable Transliteration:
              </FormLabel>
              <Switch colorScheme={"orange"}></Switch>
            </VStack>
          </HStack>
          <VStack w={"full"}>
            <Textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
            ></Textarea>
            <Textarea value={outputText} isReadOnly></Textarea>
            <Button
              onClick={async () => {
                setOutputText("");
                const inferenceResult = await fetchTranslation({
                  sourceLanguage,
                  targetLanguage,
                  input: inputText,
                  task: "translation",
                  serviceId,
                });
                setOutputText(inferenceResult["output"][0]["target"]);
              }}
              color={"a4borange"}
            >
              Translate
            </Button>
          </VStack>
        </VStack>
      </FormControl>
    </Card>
  );
}

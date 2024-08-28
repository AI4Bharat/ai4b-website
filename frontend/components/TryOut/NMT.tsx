"use client";
import React from "react";
import { useState } from "react";
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
import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
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
  const [transliteration, setTransliteration] = useState(true);
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
              <Switch
                isChecked={transliteration}
                onChange={() => setTransliteration(!transliteration)}
                colorScheme={"orange"}
              ></Switch>
            </VStack>
          </HStack>
          <VStack w={"full"}>
            <IndicTransliterate
              enabled={sourceLanguage !== "en" && transliteration}
              renderComponent={(props) => (
                <Textarea
                  minWidth={270}
                  width={{ base: "90%", md: "80%", lg: "100%" }}
                  {...props}
                />
              )}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
              }}
              lang={sourceLanguage}
            />
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

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
import axios from "axios";
import { API_URL } from "@/app/config";
import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
import { useToast } from "@chakra-ui/react";

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
    const response = await axios.post(`${API_URL}/inference/`, {
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

export default function NMT({ services }: { services: any }) {
  const [service, setService] = useState(Object.keys(services)[0]);
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("hi");
  const [transliteration, setTransliteration] = useState(true);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const toast = useToast();

  return (
    <Card borderWidth={1} borderColor={"a4borange"} boxShadow={"2xl"} p={5}>
      <FormControl isRequired>
        <VStack>
          <VStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>Select Service:</FormLabel>
              <Select
                value={service}
                onChange={(event) => {
                  setService(event.target.value);
                  setSourceLanguage(
                    services[event.target.value]["languageFilters"][
                      "sourceLanguages"
                    ][0]
                  );
                }}
              >
                {Object.entries(services).map(([key, val]) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </Select>
              <FormLabel textColor={"gray.500"}>
                Select Source Language:
              </FormLabel>
              <Select
                value={sourceLanguage}
                onChange={(event) => setSourceLanguage(event.target.value)}
              >
                {services[Object.keys(services)[0]].languageFilters
                  .sourceLanguages.length === 0 ? (
                  <></>
                ) : (
                  services[
                    Object.keys(services)[0]
                  ].languageFilters.sourceLanguages.map(
                    (language: string, index: number) => (
                      <option key={index} value={language}>
                        {(LANGUAGE_CODE_NAMES as LanguageCodeNames)[language]}
                      </option>
                    )
                  )
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
                {services[Object.keys(services)[0]].languageFilters
                  .targetLanguages.length === 0 ? (
                  <></>
                ) : (
                  services[
                    Object.keys(services)[0]
                  ].languageFilters.targetLanguages.map(
                    (language: string, index: number) => (
                      <option key={index} value={language}>
                        {(LANGUAGE_CODE_NAMES as LanguageCodeNames)[language]}
                      </option>
                    )
                  )
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
          </VStack>
          <VStack w={"full"}>
            <IndicTransliterate
              enabled={sourceLanguage !== "en" && transliteration}
              renderComponent={(props) => <Textarea {...props} />}
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
                if (inputText === "") {
                  toast({
                    title: "Input Error",
                    description: "Provide text to be translated",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                  });
                } else {
                  const inferenceResult = await fetchTranslation({
                    sourceLanguage,
                    targetLanguage,
                    input: inputText,
                    task: "translation",
                    serviceId: service,
                  });

                  setOutputText(inferenceResult["output"][0]["target"]);
                  toast({
                    title: "Success",
                    description: "Translation Inference Successful",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                  });
                }
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

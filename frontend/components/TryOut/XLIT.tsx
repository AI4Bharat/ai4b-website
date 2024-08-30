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

interface LanguageCodeNames {
  [key: string]: string;
}

export default function XLIT({
  sourceLanguages = [],
}: {
  sourceLanguages: Array<string>;
}) {
  const [sourceLanguage, setSourceLanguage] = useState("hi");
  const [inputText, setInputText] = useState("");

  return (
    <Card borderWidth={1} borderColor={"a4borange"} boxShadow={"2xl"} p={5}>
      <FormControl isRequired>
        <VStack>
          <HStack>
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
          </HStack>
          <VStack w={"full"}>
            <IndicTransliterate
              enabled={sourceLanguage !== "en"}
              renderComponent={(props) => <Textarea {...props} />}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
              }}
              lang={sourceLanguage}
            />
          </VStack>
        </VStack>
      </FormControl>
    </Card>
  );
}

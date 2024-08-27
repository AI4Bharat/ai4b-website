"use client";
import React from "react";
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

interface LanguageCodeNames {
  [key: string]: string;
}

export default function NMT({
  sourceLanguages = [],
  targetLanguages = [],
  schema,
}: {
  sourceLanguages: Array<string>;
  targetLanguages: Array<string>;
  schema: any;
}) {
  return (
    <Card borderWidth={1} borderColor={"a4borange"} boxShadow={"2xl"} p={5}>
      <FormControl>
        <VStack>
          <HStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>
                Select Source Language:
              </FormLabel>
              <Select>
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
              <Select>
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
            <Textarea></Textarea>
            <Textarea></Textarea>
            <Button color={"a4borange"}>Translate</Button>
          </VStack>
        </VStack>
      </FormControl>
    </Card>
  );
}

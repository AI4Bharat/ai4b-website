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

export default function NMT() {
  return (
    <Card borderWidth={1} borderColor={"a4borange"} boxShadow={"2xl"} p={5}>
      <FormControl>
        <VStack>
          <HStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>
                Select Source Language:
              </FormLabel>
              <Select></Select>
            </VStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>
                Select Target Language:
              </FormLabel>
              <Select></Select>
            </VStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>
                Enable Transliteration:
              </FormLabel>
              <Switch></Switch>
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

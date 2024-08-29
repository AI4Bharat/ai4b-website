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
import { useToast } from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

const fetchAudio = ({ blob }) => {
  const reader = new FileReader();
  let base64data: string | ArrayBuffer | null;
  reader.readAsDataURL(blob);
  reader.onloadend = function () {
    base64data = reader.result;
    const audioString = (base64data as string).split(",")[1];
    console.log(audioString);
  };
};

interface LanguageCodeNames {
  [key: string]: string;
}

export default function ASR({
  sourceLanguages = [],
  serviceId,
}: {
  sourceLanguages: Array<string>;
  serviceId: string;
}) {
  const recorderControls = useAudioRecorder();
  return (
    <Card borderWidth={1} borderColor={"a4borange"} boxShadow={"2xl"} p={5}>
      <FormControl isRequired>
        <VStack>
          <HStack>
            <FormLabel textColor={"gray.500"}>
              Select Source Language:
            </FormLabel>
            <Select></Select>
          </HStack>
        </VStack>
        <VStack w={"full"}>
          <AudioRecorder
            onRecordingComplete={(blob) => fetchAudio({ blob: blob })}
            recorderControls={recorderControls}
          />
          <Textarea isReadOnly></Textarea>
        </VStack>
      </FormControl>
    </Card>
  );
}

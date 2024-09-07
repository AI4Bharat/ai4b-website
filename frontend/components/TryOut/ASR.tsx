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
  Checkbox,
  Box,
  Stack,
} from "@chakra-ui/react";
import { LANGUAGE_CODE_NAMES } from "@/app/config";
import axios from "axios";
import { API_URL } from "@/app/config";
import { useToast } from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { headers } from "next/headers";

const preProcessors = ["vad"];
const postProcessors = ["itn", "punctuation"];

interface LanguageCodeNames {
  [key: string]: string;
}

export default function ASR({ services }: { services: any }) {
  const recorderControls = useAudioRecorder();
  const [service, setService] = useState(Object.keys(services)[0]);
  const [preProcessor, setPreProcessor] = useState<string[]>([]);
  const [postProcessor, setPostProcessor] = useState<string[]>([]);
  const [samplingRate, setSamplingRate] = useState(16000);
  const [sourceLanguage, setSourceLanguage] = useState(
    services[Object.keys(services)[0]]["languageFilters"]["sourceLanguages"][0]
  );
  const [outputText, setOutputText] = useState("");

  const toast = useToast();

  const fetchTranscription = async ({ blob }: { blob: Blob }) => {
    const reader = new FileReader();
    let base64data: string | ArrayBuffer | null;
    reader.readAsDataURL(blob);
    let response: any;
    reader.onloadend = async function () {
      base64data = reader.result;
      const audioString = (base64data as string).split(",")[1];
      try {
        const response = await axios.post(`${API_URL}/inference/transcribe`, {
          sourceLanguage: sourceLanguage,
          audioContent: audioString,
          task: "asr",
          serviceId: service,
          samplingRate: samplingRate,
          preProcessors: preProcessor,
          postProcessors: postProcessor,
        });
        if (response.status === 200) {
          setOutputText(response.data["output"][0]["source"]);
          toast({
            title: "Success",
            description: "Translation Inference Successful",
            status: "success",
            duration: 4000,
            isClosable: true,
          });
        }
      } catch (error: any) {
        const response = error.response;
        if (response.status === 403) {
          setOutputText("");
          toast({
            title: "Warning",
            description: "You have reached maximum trials in a minute",
            status: "warning",
            duration: 4000,
            isClosable: true,
          });
        } else if (response.status === 503) {
          setOutputText("");
          toast({
            title: "Warning",
            description:
              "Service Currently Unavailable, Please Try Again Later",
            status: "warning",
            duration: 4000,
            isClosable: true,
          });
        }
      }
    };
  };

  const handlePreCheckboxChange = (value: string) => {
    setPreProcessor((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
    console.log(preProcessor);
  };

  const handlePostCheckboxChange = (value: string) => {
    setPostProcessor((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
    console.log(postProcessor);
  };

  return (
    <Card borderWidth={1} borderColor={"a4borange"} boxShadow={"2xl"} p={5}>
      <FormControl isRequired>
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
          <FormLabel textColor={"gray.500"}>Select Source Language:</FormLabel>
          <Select onChange={(event) => setSourceLanguage(event.target.value)}>
            {services[service].languageFilters.sourceLanguages.map(
              (language: string) => (
                <option key={language} value={language}>
                  {(LANGUAGE_CODE_NAMES as LanguageCodeNames)[language]}
                </option>
              )
            )}
          </Select>
          <FormLabel textColor={"gray.500"}>Select Pre Processors:</FormLabel>
          <Box>
            <HStack spacing={4}>
              {preProcessors.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={preProcessor.includes(option)}
                  onChange={() => handlePreCheckboxChange(option)}
                >
                  {option}
                </Checkbox>
              ))}
            </HStack>
          </Box>
          <FormLabel textColor={"gray.500"}>Select Post Processors:</FormLabel>
          <Box>
            <HStack spacing={4}>
              {postProcessors.map((option) => (
                <Checkbox
                  key={option}
                  isChecked={postProcessor.includes(option)}
                  onChange={() => handlePostCheckboxChange(option)}
                >
                  {option}
                </Checkbox>
              ))}
            </HStack>
          </Box>
          <FormLabel textColor={"gray.500"}>Select Sampling Rate:</FormLabel>
          <Select
            value={samplingRate}
            onChange={(event) => setSamplingRate(parseInt(event.target.value))}
          >
            <option value={8000}>8000</option>
            <option value={16000}>16000</option>
            <option value={48000}>48000</option>
          </Select>
        </VStack>
        <VStack p={5} w={"full"}>
          <AudioRecorder
            onRecordingComplete={(blob) => {
              setOutputText("");
              fetchTranscription({ blob: blob });
            }}
            recorderControls={recorderControls}
          />
          <Textarea width={344} value={outputText} isReadOnly></Textarea>
        </VStack>
      </FormControl>
    </Card>
  );
}

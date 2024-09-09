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
import Feedback from "../Feedback";

const fetchAudio = async ({
  sourceLanguage,
  input,
  gender,
  samplingRate,
  serviceId,
}: {
  sourceLanguage: string;
  input: string;
  gender: string;
  samplingRate: number;
  serviceId: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/inference/convert`, {
      sourceLanguage: sourceLanguage,
      input: input,
      task: "tts",
      serviceId: serviceId,
      samplingRate: samplingRate,
      gender: gender,
    });
    return response;
  } catch (error: any) {
    return error.response;
  }
  // return "data:audio/wav;base64," + result["audio"][0]["audioContent"];
};

interface LanguageCodeNames {
  [key: string]: string;
}

export default function TTS({ services }: { services: any }) {
  const [service, setService] = useState(Object.keys(services)[0]);
  const [sourceLanguage, setSourceLanguage] = useState(
    services[Object.keys(services)[0]]["languageFilters"]["sourceLanguages"][0]
  );
  const [samplingRate, setSamplingRate] = useState(16000);
  const [gender, setGender] = useState("female");
  const [transliteration, setTransliteration] = useState(true);
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");

  const [success, setSuccess] = useState(false);

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
              <HStack>
                <VStack>
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
                      services[service].languageFilters.sourceLanguages.map(
                        (language: string, index: number) => (
                          <option key={index} value={language}>
                            {
                              (LANGUAGE_CODE_NAMES as LanguageCodeNames)[
                                language
                              ]
                            }
                          </option>
                        )
                      )
                    )}
                  </Select>
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
            </VStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>
                Select Sampling Rate:
              </FormLabel>
              <Select
                onChange={(event) =>
                  setSamplingRate(parseInt(event.target.value))
                }
                value={samplingRate}
              >
                <option value={8000}>8000</option>
                <option value={16000}>16000</option>
                <option value={48000}>48000</option>
              </Select>
            </VStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>Select Voice Gender:</FormLabel>
              <Select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
              >
                <option value={"male"}>Male</option>
                <option value={"female"}>Female</option>
              </Select>
            </VStack>
          </VStack>
          <VStack w={"full"}>
            <IndicTransliterate
              enabled={sourceLanguage !== "en" && transliteration}
              renderComponent={(props) => <Textarea w={344} {...props} />}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
              }}
              lang={sourceLanguage}
            />
            <Button
              onClick={async () => {
                setOutput("");
                setSuccess(false);
                try {
                  const response = await fetchAudio({
                    sourceLanguage,
                    input: inputText,
                    gender: gender,
                    samplingRate: samplingRate,
                    serviceId: service,
                  });
                  if (response.status === 200) {
                    setSuccess(true);
                    const result = response.data;
                    setOutput(result["audio"][0]["audioContent"]);
                    toast({
                      title: "Success",
                      description: "Translation Inference Successful",
                      status: "success",
                      duration: 4000,
                      isClosable: true,
                    });
                  } else if (response.status === 403) {
                    setSuccess(false);
                    setOutput("");
                    toast({
                      title: "Warning",
                      description:
                        "You have reached maximum trials in a minute",
                      status: "warning",
                      duration: 4000,
                      isClosable: true,
                    });
                  } else {
                    setSuccess(false);
                    setOutput("");
                    toast({
                      title: "Warning",
                      description:
                        "Service Currently Unavailable, Please Try Again Later",
                      status: "warning",
                      duration: 4000,
                      isClosable: true,
                    });
                  }
                } catch (error) {
                  setSuccess(false);
                  setOutput("");
                  toast({
                    title: "Warning",
                    description:
                      "Service Currently Unavailable, Please Try Again Later",
                    status: "warning",
                    duration: 4000,
                    isClosable: true,
                  });
                }
              }}
              color={"a4borange"}
            >
              Convert
            </Button>
            {output !== "" ? (
              <audio src={"data:audio/wav;base64," + output} controls />
            ) : (
              <></>
            )}
            {success ? (
              <Feedback
                serviceId={service}
                task="tts"
                modelInput={inputText}
                modelResponse={output}
              />
            ) : (
              <></>
            )}
          </VStack>
        </VStack>
      </FormControl>
    </Card>
  );
}

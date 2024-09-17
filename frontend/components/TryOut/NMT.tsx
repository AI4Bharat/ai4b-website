"use client";
import { API_URL, LANGUAGE_CODE_NAMES } from "@/app/config";
import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
import {
  Button,
  Card,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Textarea,
  useToast,
  VStack,
  Progress,
  CircularProgress,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import Feedback from "../Feedback";

const fetchTranslation = async ({
  sourceLanguage,
  targetLanguage,
  input,
  task,
  serviceId,
  track,
}: {
  sourceLanguage: string;
  targetLanguage: string;
  input: string;
  task: string;
  serviceId: string;
  track: boolean;
}) => {
  try {
    const response = await axios.post(`${API_URL}/inference/translate`, {
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      input: input,
      task: task,
      serviceId: serviceId,
      track: track,
    });
    return response;
  } catch (error: any) {
    return error.response;
  }
};

interface LanguageCodeNames {
  [key: string]: string;
}

export default function NMT({ services }: { services: any }) {
  const [service, setService] = useState(Object.keys(services)[0]);
  const [sourceLanguage, setSourceLanguage] = useState(
    services[Object.keys(services)[0]]["languageFilters"]["sourceLanguages"][0]
  );
  const [targetLanguage, setTargetLanguage] = useState(
    services[Object.keys(services)[0]]["languageFilters"]["targetLanguages"][0]
  );
  const [transliteration, setTransliteration] = useState(true);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tracking, setTracking] = useState(true);

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
                  services[service].languageFilters.sourceLanguages.map(
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
                  services[service].languageFilters.targetLanguages.map(
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
              <FormLabel textColor={"gray.500"}>
                Allow the AI to be improved by usage analysis.
              </FormLabel>
              <Switch
                isChecked={tracking}
                onChange={(e) => setTracking(e.target.checked)}
                colorScheme="orange"
              />
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
                setSuccess(false);
                if (inputText === "") {
                  toast({
                    title: "Input Error",
                    description: "Provide text to be translated",
                    status: "warning",
                    duration: 5000,
                    isClosable: true,
                  });
                } else {
                  try {
                    setIsLoading(true);
                    const response = await fetchTranslation({
                      sourceLanguage: sourceLanguage,
                      targetLanguage: targetLanguage,
                      input: inputText,
                      task: "translation",
                      serviceId: service,
                      track: tracking,
                    });
                    setIsLoading(false);
                    if (response.status === 200) {
                      setSuccess(true);
                      setOutputText(response.data["output"][0]["target"]);
                      toast({
                        title: "Success",
                        description: "Translation Inference Successful",
                        status: "success",
                        duration: 4000,
                        isClosable: true,
                      });
                      setSuccess(true);
                    } else if (response.status === 403) {
                      setSuccess(false);
                      setOutputText("");
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
                  } catch (error) {
                    setIsLoading(false);
                    setSuccess(false);
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
              }}
              color={"a4borange"}
            >
              Translate
            </Button>
            {success ? (
              <Feedback
                serviceId={service}
                task="translation"
                modelInput={inputText}
                modelResponse={outputText}
                sourceLanguage={sourceLanguage}
                targetLanguage={targetLanguage}
                domain="general"
                track={tracking}
              />
            ) : (
              <>
                {isLoading ? (
                  <CircularProgress isIndeterminate color="a4borange" />
                ) : (
                  <></>
                )}
              </>
            )}
          </VStack>
        </VStack>
      </FormControl>
    </Card>
  );
}

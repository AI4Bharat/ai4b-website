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
}: {
  sourceLanguage: string;
  targetLanguage: string;
  input: string;
  task: string;
  serviceId: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/inference/translate`, {
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      input: input,
      task: task,
      serviceId: serviceId,
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
  const languageOptions = Object.entries(services).flatMap(([serviceId, serviceData]) =>
    serviceData.languageFilters.sourceLanguages.map((language: string) => ({
      serviceId,
      language,
      label: (LANGUAGE_CODE_NAMES as LanguageCodeNames)[language],
    }))
  );

  const [service, setService] = useState(languageOptions[0].serviceId);
  const [sourceLanguage, setSourceLanguage] = useState(languageOptions[0].language);
  const [targetLanguage, setTargetLanguage] = useState(
    services[Object.keys(services)[0]]["languageFilters"]["targetLanguages"][0]
  );
  const [transliteration, setTransliteration] = useState(true);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    const selectedOption = languageOptions.find(
      (option) => option.language === selectedLanguage
    );
    if (selectedOption) {
      setService(selectedOption.serviceId);
      setSourceLanguage(selectedOption.language);
    }
  };

  return (
    <Card borderWidth={1} borderColor={"a4borange"} boxShadow={"2xl"} p={5}>
      <FormControl isRequired>
        <VStack>
          <VStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>Select Source Language:</FormLabel>
              <Select
                value={(LANGUAGE_CODE_NAMES as LanguageCodeNames)[sourceLanguage]}
                onChange={handleLanguageChange}
              >
                {languageOptions.map((option, index) => (
                  <option key={index} value={option.language}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </VStack>
            <VStack>
              <FormLabel textColor={"gray.500"}>Select Target Language:</FormLabel>
              <Select
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
              >
                {services[Object.keys(services)[0]].languageFilters.targetLanguages.length === 0 ? (
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
              <FormLabel textColor={"gray.500"}>Enable Transliteration:</FormLabel>
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
                        description: "You have reached maximum trials in a minute",
                        status: "warning",
                        duration: 4000,
                        isClosable: true,
                      });
                    } else {
                      setSuccess(false);
                      setOutputText("");
                      toast({
                        title: "Warning",
                        description: "Service Currently Unavailable, Please Try Again Later",
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
                      description: "Service Currently Unavailable, Please Try Again Later",
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

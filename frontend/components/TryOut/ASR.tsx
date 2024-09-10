"use client";
import { API_URL, LANGUAGE_CODE_NAMES } from "@/app/config";
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Select,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { ChangeEventHandler, useRef, useState } from "react";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import { FaUpload } from "react-icons/fa";
import Feedback from "../Feedback";

const preProcessors = ["vad"];
const postProcessors = ["itn", "punctuation"];
const domains = {
  General: "general",
  "Digital payments": "digital_payments",
  "Bigbasket commands": "bigbasket_commands",
  "Umang commands": "umang_commands",
  Digilocker: "digilocker",
  "Passport Seva": "passport_seva",
  "Crop insurance": "crop_insurance",
  "Electricity bill payments": "electricity_bill_payments",
  "Gas booking": "gas_booking",
  Aadhaar: "aadhaar",
  "Clothe Shopping": "clothe_shopping",
  "Electronic Shopping": "electronic_shopping",
  EPFO: "epfo",
  "Pan Services": "pan_services",
  PMKVY: "pmkvy",
  "Health services": "health_services",
  "Parivahan (Transport)": "parivahan_transport",
  Startups: "startups",
  "Flight Booking": "flight_booking",
  Garbage: "garbage",
  GST: "gst",
  "Landline Bill Payment": "landline_bill_payment",
  ITR: "itr",
  "Mobile recharge and bill Payment": "mobile_recharge_and_bill_payment",
  "Movie, Shows": "movie_shows",
  NPS: "nps",
  "ORS (Birth/Death)": "ors_birth_death",
  "Railway Booking": "railway_booking",
  "Water Services": "water_services",
};

interface LanguageCodeNames {
  [key: string]: string;
}
function FileUploadButton({
  handleFileChange,
}: {
  handleFileChange: ChangeEventHandler;
}) {
  const inputRef = useRef(null);

  const handleButtonClick = () => {
    (inputRef as any).current.click();
  };

  return (
    <>
      <Input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        display="none"
        onClick={(event: any) => {
          event.target.value = null;
        }}
      />
      <Button onClick={handleButtonClick} bg="a4borange">
        <FaUpload color="white" />
      </Button>
    </>
  );
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
  const [audioString, setAudioString] = useState("");
  const [domain, setDomain] = useState("general");

  const [success, setSuccess] = useState(false);

  const toast = useToast();

  const fetchTranscription = async ({ blob }: { blob: Blob }) => {
    setSuccess(false);
    setAudioString("");
    const reader = new FileReader();
    let base64data: string | ArrayBuffer | null;
    reader.readAsDataURL(blob);
    let response: any;
    reader.onloadend = async function () {
      base64data = reader.result;
      const audioString = (base64data as string).split(",")[1];
      setAudioString(audioString);
      try {
        const response = await axios.post(`${API_URL}/inference/transcribe`, {
          sourceLanguage: sourceLanguage,
          audioContent: audioString,
          task: "asr",
          domain: domain,
          serviceId: service,
          samplingRate: samplingRate,
          preProcessors: preProcessor,
          postProcessors: postProcessor,
        });
        if (response.status === 200) {
          setSuccess(true);
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
        try {
          const response = error.response;
          if (response.status === 403) {
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
              description:
                "Service Currently Unavailable, Please Try Again Later",
              status: "warning",
              duration: 4000,
              isClosable: true,
            });
          }
        } catch (error) {
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

  const handleFileChange = (event: any) => {
    setSuccess(false);
    setAudioString("");
    const file = event.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const audio = new Audio(fileURL);
      audio.play();
      const selectedAudioReader = new FileReader();
      selectedAudioReader.readAsDataURL(file);
      selectedAudioReader.onloadend = async () => {
        const audioString = (selectedAudioReader.result as string).split(
          ","
        )[1];
        setAudioString(audioString);
        try {
          const response = await axios.post(`${API_URL}/inference/transcribe`, {
            sourceLanguage: sourceLanguage,
            audioContent: audioString,
            task: "asr",
            serviceId: service,
            domain: domain,
            samplingRate: samplingRate,
            preProcessors: preProcessor,
            postProcessors: postProcessor,
          });
          if (response.status === 200) {
            setSuccess(true);
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
          try {
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
            } else {
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
    }
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
          <FormLabel textColor={"gray.500"}>Domain:</FormLabel>
          <Select
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
          >
            {Object.entries(domains).map(([key, val]) => (
              <option key={val} value={val}>
                {key}
              </option>
            ))}
          </Select>
          <FormHelperText>
            Please Choose a domain for your audio. (For evaluation purposes)
          </FormHelperText>
        </VStack>
        <VStack p={5} w={"full"}>
          <HStack>
            <AudioRecorder
              onRecordingComplete={(blob) => {
                setOutputText("");
                fetchTranscription({ blob: blob });
              }}
              recorderControls={recorderControls}
            />
            {/* <FileUploadButton handleFileChange={handleFileChange} /> */}
          </HStack>
          <Textarea value={outputText} isReadOnly></Textarea>
          {success ? (
            <Feedback
              serviceId={service}
              task="asr"
              modelInput={audioString}
              modelResponse={outputText}
              sourceLanguage={sourceLanguage}
              targetLanguage={""}
              domain={domain}
            />
          ) : (
            <></>
          )}
        </VStack>
      </FormControl>
    </Card>
  );
}
